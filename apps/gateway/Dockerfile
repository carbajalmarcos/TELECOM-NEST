# FROM nginx:1.18
# # RUN apk add --no-cache nginx-mod-http-perl nginx-module-image-filter@nginx nginx-module-njs@nginx
# COPY conf/prod.conf /etc/nginx/conf.d/prod.conf
# COPY conf/env_cofig.js /etc/nginx/conf.d/env_cofig.js

FROM nginx:1.18.0-alpine-perl
RUN apk add --no-cache nginx-mod-http-perl
COPY nginx.conf /etc/nginx
COPY default.conf /etc/nginx/conf.d
CMD ["/bin/sh", "-c", "exec nginx -g 'daemon off;';"]
WORKDIR /usr/share/nginx/html