'use client';
import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache, NormalizedCacheObject, split } from "@apollo/client";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";
import { CachePersistor, LocalStorageWrapper } from 'apollo3-cache-persist';
const httpUrl: string = 'http://localhost:5001/graphql';
const wsUrl: string = 'ws://localhost:5001/graphql';
const httpLink: ApolloLink = createHttpLink({ 
    uri: httpUrl,
    credentials: 'include',

});
const wsLink: ApolloLink = new GraphQLWsLink(
    createClient({
        url: wsUrl,
        retryAttempts: 20,
        shouldRetry: () => true,
        on: {
            closed: () => {
                console.log('Client Connection closed');
            },
            connected: () => {
                console.log('Client Connected');
            }
        }
    })
);

function isSubscription({ query }: { query: any }): boolean {
    const definition = getMainDefinition(query);
    return definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.SUBSCRIPTION;
}

const cache: InMemoryCache = new InMemoryCache();
export let apolloPersistor: CachePersistor<NormalizedCacheObject> | null = null;

export const initPersistorCache = async (): Promise<void> => {
    apolloPersistor = new CachePersistor({
        cache,
        storage: new LocalStorageWrapper(window.localStorage),
        trigger: 'write',
        debug: false
    });
    await apolloPersistor.restore();
};

initPersistorCache();

export const apolloClient = new ApolloClient<NormalizedCacheObject>({
    link: split(isSubscription, wsLink, httpLink),
    cache: cache,
    connectToDevTools: true,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'ignore'
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all'
        },
        mutate: {
            errorPolicy: 'all'
        }
    }
});