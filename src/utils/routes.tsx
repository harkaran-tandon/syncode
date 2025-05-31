import { RouteObject } from 'react-router-dom';
import Home from '../features/Home';
import Room from '../features/Room';

const paths = ['/haven', '/dungeon', '/chamber', '/sanctuary', '/nest', '/cove', '/hideout', '/den', '/vault'];

const routes: RouteObject[] = [
    
  {
    path: '/',
    element: <Home />,
  },
  ...paths.map(path => ({
  path,
  element: <Room />,
})),
];

export default routes;
