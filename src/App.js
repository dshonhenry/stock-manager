import React from 'react';
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';
import Manager from './components/Manager';

function App() {
  return (
    <ChakraProvider theme={theme}>
        <Manager/>
    </ChakraProvider>
  );
}

export default App;
