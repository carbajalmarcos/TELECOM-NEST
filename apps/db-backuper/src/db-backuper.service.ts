import { Injectable } from '@nestjs/common';
import {
  ConversationDto,
  MessageDto,
  MessageService,
  mtMessageType,
  toJasminParams,
} from '@telecom/message';

import { exec, spawn } from 'child_process';
import { stderr } from 'process';

@Injectable()
export class DbBackuperService {
  constructor(private readonly messageService: MessageService) {}

  private getQuery = (): string => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    //TODO: now - 120 days
    const dateTo = new Date(now.setDate(now.getDate() - 1));
    return JSON.stringify({
      createdAt: {
        $lt: dateTo,
      },
    });
  };

  async startBackupAndMigration(): Promise<void> {
    const now = new Date();
    // const exec = executor.exec;
    const dbProductive = process.env.MESSAGE_DB,
      host = process.env.DB_HOST,
      port = process.env.MONGO_DB_PORT ?? '27017',
      user = process.env.DB_USERNAME,
      pass = process.env.DB_PASSWORD,
      dbHistoric = process.env.HISTORIC_DB,
      query = this.getQuery(),
      path = './backup',
      currentDay = `${now.getFullYear()}${now.getMonth()}${now.getDate()}`;

    // TODO : do 120 days query
    const dumpMessagesCmd = `mongodump --query='${query}' --collection=messages --host=${host} --port=${port} --db=${dbProductive} --username=${user} --password=${pass}  --authenticationDatabase=admin --out=${path}/${currentDay}`;
    const dumpConversationsCmd = `mongodump --query='${query}' --collection=conversations --host=${host} --port=${port} --db=${dbProductive} --username=${user} --password=${pass}  --authenticationDatabase=admin --out=${path}/${currentDay}`;
    const restoreMessagesTimeCmd = `mongorestore --host=${host} --port=${port} --db=${dbHistoric} --username=${user} --password=${pass}  --authenticationDatabase=admin --collection=messages ${path}/${currentDay}/${dbProductive}/messages.bson`;
    const restoreConversationsTimeCmd = `mongorestore --host=${host} --port=${port} --db=${dbHistoric} --username=${user} --password=${pass}  --authenticationDatabase=admin --collection=conversations ${path}/${currentDay}/${dbProductive}/conversations.bson`;

    console.log(
      '**************************** DUMPS INIT LOGS****************************',
    );
    console.log('dumpMessagesCmd:');
    console.log(dumpMessagesCmd);
    console.log('dumpConversationsCmd:');

    console.log(dumpConversationsCmd);

    console.log(
      '**************************** DUMPS END LOGS****************************',
    );
    console.log(
      '**************************** RESTORES INIT LOGS ****************************',
    );
    console.log(restoreMessagesTimeCmd);
    console.log(restoreConversationsTimeCmd);
    console.log(
      '**************************** RESTORES END LOGS ****************************',
    );
    try {
      exec(dumpMessagesCmd, (err: any, outputDump: any, stderr: any) => {
        if (err) {
          console.log('dumpMessagesCmd::', err);
          throw err;
        }
        console.log('dumpMessagesCmd:: outputDump :: ', outputDump);
        console.log('dumpMessagesCmd:: stderr :: ', stderr);
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
            exec(restoreConversationsTimeCmd, (err: any, outputDump: any) => {
              if (err) {
                console.log('restoreConversationsTimeCmd::', err);
                throw err;
              }
            });
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
