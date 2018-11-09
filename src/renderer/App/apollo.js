import { ApolloClient } from 'apollo-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from 'electron';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory';
import { getMainDefinition } from 'apollo-utilities';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
// import { withClientState } from "apollo-link-state";
import { ApolloLink, split } from 'apollo-link';
import { COOKIE_TYPE_MAP } from '../../common/types';

export default (
  fetch,
  { state = {}, fragments: introspectionQueryResultData } = {}
) => {
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  });
  const subscriptionUrl = remote.getGlobal('__SUBSCRIPTION_URL__');
  const uri = remote.getGlobal('__GRAPHQL_URL__');
  const link = ApolloLink.from(
    [
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.map(({ message, locations, path }) =>
            // eslint-disable-next-line no-console
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );

        if (networkError)
          // eslint-disable-next-line no-console
          console.log(`[Network error]: ${networkError.stack}`);
      }),
      setContext((request, { headers, ...prev }) => {
        const token = window.store.get(COOKIE_TYPE_MAP.token);
        const csurfToken = window.store.get(COOKIE_TYPE_MAP.csurfToken);

        return {
          ...prev,
          uri,
          fetch,
          credentials: 'include',
          headers: {
            ...headers,
            'Access-Control-Allow-Credentials': true,
            authorization: token ? `Bearer ${token}` : '',
            'x-xsrf-token': csurfToken
          }
        };
      }),
      new HttpLink({
        uri,
        fetch,
        // credentials: 'include',
        headers: undefined
      })
    ].filter(v => v)
  );

  const cache = new InMemoryCache({ fragmentMatcher });
  const client = new ApolloClient({
    link: split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);

        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      new WebSocketLink({
        uri: subscriptionUrl,
        options: {
          reconnect: true,
          connectionParams: () => ({
            authToken: window.store.get(COOKIE_TYPE_MAP.token)
          })
        }
      }),
      // link,

      link
    ),
    cache: cache.restore(state),
    ssrForceFetchDelay: undefined
  });

  return client;
};
