/* @flow */
import _ from 'lodash';

const URL = 'ws://localhost:8080';

export const fetchEventsForCode = (code: string) =>
  new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(URL);

      ws.addEventListener('open', (event) => {
        const command = { type: 'RunCode', payload: code };
        ws.send(JSON.stringify(command))
      });

      ws.addEventListener('message', (event) => {
        const events = JSON.parse(event.data || [{}]);

        console.log('Events:', events);

        const didError = events[0].type === 'UncaughtError';

        if (didError) {
          const msg = _.get(events[0], 'payload.error.name') === 'SyntaxError'
            ? 'Failed to run script due to syntax error.'
            : 'Failed to run script.';
          reject(new Error(msg));
        } else {
          resolve(events);
        }

        ws.close();
      });
    } catch (e) {
      reject(new Error('Failed to connect to backend.'));
    }
  });