import * as Transport from 'winston-transport';
import { TelemetryClient } from 'applicationinsights';
import * as appInsights from 'applicationinsights';

class AppInsightsTransport extends Transport {
  private client: TelemetryClient | null;

  constructor(opts: any) {
    super(opts);
    this.client = appInsights.defaultClient || null;
  }

  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    if (!this.client) {
      callback();
      return;
    }

    try {
      const metaFromInfo = info.meta || info.metadata || info.metaData || {};
      const splat =
        info[Symbol.for('splat')] && info[Symbol.for('splat')][0]
          ? info[Symbol.for('splat')][0]
          : {};
      const extraProps = { ...info };
      delete extraProps.level;
      delete extraProps.message;
      const properties = Object.assign({}, metaFromInfo, splat, extraProps);

      this.client.trackTrace({
        message: String(info.message),
        properties: properties,
      });

      if (properties && properties.stack) {
        this.client.trackException({
          exception: new Error(String(info.message)),
        });
      }
    } catch (e) {
      // swallow
    }

    callback();
  }
}

export { AppInsightsTransport };
