import { EndpointApiEvent } from '../../types';
import { EventQueueInterface } from './EventQueueInterface';

/**
 * Event queue from the PrivMX Endpoint Web
 * The event queue gets events from every connection, so use it as a singleton instance.
 */
export class EventQueue implements EventQueueInterface {
    public constructor(private api: EventQueueInterface) {}
    async emitBreakEvent(): Promise<void> {
        return await this.api.emitBreakEvent();
    }

    async waitEvent(): Promise<EndpointApiEvent> {
        return await this.api.waitEvent();
    }
}
