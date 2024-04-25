FROM node:18-alpine As develop

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install
COPY --chown=node:node . .
USER node


FROM node:18-alpine As build

WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./
COPY --chown=node:node --from=develop /app/node_modules ./node_modules
COPY --chown=node:node . .


RUN yarn prisma generate
RUN yarn run build

USER node


FROM node:18-alpine As production

WORKDIR /app

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

CMD ["node", "dist/main.js"]
# ENTRYPOINT ["tail", "-f", "/dev/null"]