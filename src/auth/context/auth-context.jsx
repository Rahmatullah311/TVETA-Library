import { useContext,createContext  } from 'react';


// ----------------------------------------------------------------------

export const AuthContext = createContext(undefined);



// Custom hook to use AuthContext
export function useAuth() {
  return useContext(AuthContext);
}