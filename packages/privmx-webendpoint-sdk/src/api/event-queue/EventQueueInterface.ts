import { EndpointApiEvent } from '../../types';

export interface EventQueueInterface {
    /**
     * Waits for event and returns when one is caught
     * @returns {EndpointApiEvent} object {@link EndpointApiEvent}
     */
    waitEvent: () => Promise<EndpointApiEvent>;

    /**
     * Emits an event to the event queue of type "libBreak";
     * @returns {Promise<void>}
     */
    emitBreakEvent: () => Promise<void>;
}
