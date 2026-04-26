"use client";

import React, { createContext, useContext } from "react";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";
import { nhost } from "@/lib/nhost";

// Custom Nhost Context to bypass the @nhost/react package crash
export const NhostContext = createContext(nhost);

// Manually configure Apollo Client to avoid the @nhost/react-apollo version mismatch crash
const httpLink = createHttpLink({
  uri: nhost.graphql.httpUrl || `https://${process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN}.graphql.${process.env.NEXT_PUBLIC_NHOST_REGION}.nhost.run/v1`,
});

const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export function NhostProvider({ children }: { children: React.ReactNode }) {
  return (
    <NhostContext.Provider value={nhost}>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </NhostContext.Provider>
  );
}
