#BUILD FOR LOCAL DEVELOPMENT
FROM node:19-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN yarn install

COPY --chown=node:node . .

RUN npm run prisma:generate

USER node

# BUILD FOR PRODUCTION
FROM node:19-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN yarn install --production

USER node

# PRODUCTION
FROM node:19-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]