import { useRoutes } from 'react-router-dom';
import routes from './utils/routes';

function App() {
  return useRoutes(routes);
}

export default App;