import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { utils } from '@telecom/constants';
import {
  MessageService,
  SearchConversationDto,
  SearchMessageDto,
} from '@telecom/message';

import { exec } from 'child_process';

@Injectable()
export class DbBackuperService {
  constructor(private readonly messageService: MessageService) {}

  private getQuery = (dateTo: Date): string => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return JSON.stringify({
      createdAt: {
        $lt: { $date: new Date(dateTo.toISOString()) },
      },
    });
  };

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async startBackupAndMigration(): Promise<void> {
    const now = new Date();
    //TODO: now - 120 days
    // const dateTo = new Date(now.setDate(now.getDate()));
    const dateTo = new Date();
    dateTo.setDate(dateTo.getDate() - utils.OLD_DAY_HISTORIC);
    // const exec = executor.exec;
    const dbProductive = process.env.MESSAGE_DB,
      host = process.env.DB_HOST,
      port = process.env.MONGO_DB_PORT ?? '27017',
      user = process.env.DB_USERNAME,
      pass = process.env.DB_PASSWORD,
      dbHistoric = process.env.HISTORIC_DB,
      query = this.getQuery(dateTo),
      path = './backup',
      currentDay = `${now.getFullYear()}${now.getMonth()}${now.getDate()}`;
    // TODO : do 120 days query
    const dumpMessagesCmd = `mongoexport --query='${query}' --collection=messages --host=${host} --port=${port} --db=${dbProductive} --username=${user} --password=${pass}  --authenticationDatabase=admin --out=${path}/${currentDay}-messages.json`;
    const dumpConversationsCmd = `mongoexport --query='${query}' --collection=conversations --host=${host} --port=${port} --db=${dbProductive} --username=${user} --password=${pass}  --authenticationDatabase=admin --out=${path}/${currentDay}-conversations.json`;
    const restoreMessagesTimeCmd = `mongoimport --mode=upsert --host=${host} --port=${port} --db=${dbHistoric} --username=${user} --password=${pass}  --authenticationDatabase=admin --collection=messages ${path}/${currentDay}-messages.json `;
    const restoreConversationsTimeCmd = `mongoimport --mode=upsert --host=${host} --port=${port} --db=${dbHistoric} --username=${user} --password=${pass}  --authenticationDatabase=admin --collection=conversations  ${path}/${currentDay}-conversations.json`;

    console.log('dumpMessagesCmd:');
    console.log(dumpMessagesCmd);
    console.log('dumpConversationsCmd:');
    console.log(dumpConversationsCmd);
    console.log('restoreMessagesTimeCmd:');
    console.log(restoreMessagesTimeCmd);
    console.log('restoreConversationsTimeCmd:');
    console.log(restoreConversationsTimeCmd);

    try {
      exec(dumpMessagesCmd, (err: any, outputDump: any, stderr: any) => {
        if (err) {
          console.log('dumpMessagesCmd::', err);
          throw err;
        }
        exec(dumpConversationsCmd, (err: any, outputDump: any) => {
          if (err) {
            console.log('dumpConversationsCmd::', err);
            throw err;
          }
          exec(restoreMessagesTimeCmd, (err: any, outputDump: any) => {
            if (err) {
              console.log('restoreMessagesTimeCmd::', err);
              throw err;
            }
            exec(
              restoreConversationsTimeCmd,
              async (err: any, outputDump: any) => {
                if (err) {
                  console.log('restoreConversationsTimeCmd::', err);
                  throw err;
                }
                try {
                  const searchMessageDto = new SearchMessageDto();
                  searchMessageDto.createdAt = dateTo;
                  const deleteMessagesResult =
                    await this.messageService.deleteMessagesByLt(
                      searchMessageDto,
                    );
                  console.log('deleteMessagesResult:: ', deleteMessagesResult);
                  const searchConversationDto = new SearchConversationDto();
                  searchConversationDto.updatedAt = dateTo;
                  const deleteConversatonsResult =
                    await this.messageService.deleteConversationsByLt(
                      searchMessageDto,
                    );
                  console.log(
                    'deleteConversationsResult:: ',
                    deleteConversatonsResult,
                  );
                } catch (error) {
                  console.log('after dump and restore error :: ', error);
                }
              },
            );
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
