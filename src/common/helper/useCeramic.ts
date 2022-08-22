import { CeramicClient } from '@ceramicnetwork/http-client'
import { useContext, createContext } from 'react'


class CeramicContextClass {
  Ceramic: CeramicClient;

  constructor() {
    this.Ceramic = new CeramicClient('https://ceramic-node.vitalpointai.com');
  }

}
export const CeramicInstance = new CeramicContextClass();

export const CeramicContext = createContext(CeramicInstance);


export function useCeramic() {
  const ac = useContext(CeramicContext)

  return {
    Ceramic: ac.Ceramic
  }
}