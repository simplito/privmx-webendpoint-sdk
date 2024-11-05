import { Channel, EndpointApiEvent } from './types';

/**
 * Class for handling events and registering listeners
 */
export class EventDispatcher {
    listeners: Map<Channel, Map<EndpointApiEvent['type'], Function[]>>;
    channels: Set<Channel>;

    constructor() {
        this.listeners = new Map();
        this.channels = new Set<Channel>();
    }

    /**
     * Add a event listeners on given channel and eventType
     * @param {Channel} channel channel
     * @param {string} eventType type of the event
     * @param {function} callback callback function
     * @returns {function} function to remove the event listeners
     */
    addEventListener = (
        channel: Channel,
        eventType: EndpointApiEvent['type'],
        callback: Function
    ): (() => void) => {
        if (this.listeners.has(channel)) {
            if (this.listeners.get(channel)?.has(eventType)) {
                this.listeners.get(channel)?.get(eventType)?.push(callback);
            } else {
                this.listeners.get(channel)?.set(eventType, [callback]);
            }
        } else {
            this.listeners.set(channel, new Map([[eventType, [callback]]]));
        }
        return () => {
            this.removeEventListener(channel, eventType, callback);
        };
    };

    /**
     * Removes an event listeners from given `channel` and `eventType`
     * @param {Channel} channel channel
     * @param {string} eventType type of the event
     * @param {function} callback callback function
     */
    removeEventListener = (
        channel: Channel,
        eventType: EndpointApiEvent['type'],
        callback: Function
    ): void => {
        if (this.listeners.has(channel)) {
            const channelCallbacks = this.listeners.get(channel);
            const newCallback = channelCallbacks?.get(eventType)?.filter((cb) => cb !== callback);
            if (newCallback) {
                channelCallbacks?.set(eventType, newCallback);
            }
        }
    };

    /**
     * Removes all event listeners
     * @returns {void}
     */
    removeAllListeners = (): void => {
        this.listeners.clear();
        this.channels.clear();
    };

    /**
     * Dispatches an event
     * @param {EndpointApiEvent} event
     * @returns {void}
     */
    dispatchEvent = (event: EndpointApiEvent): void => {
        if (this.listeners.has(event.channel)) {
            if (this.listeners.has(event.channel)) {
                const callbacks = this.listeners.get(event.channel)!.get(event.type) || [];
                callbacks.forEach((callback) => callback(event));
            }
        }
    };

    /**
     * Removes all listeners from given channel
     * @param {Channel} channel channel
     * @returns {void}
     */
    removeChannelEvents = (channel: Channel): void => {
        if (this.listeners.has(channel)) {
            this.listeners.delete(channel);
        }
    };

    /**
     * Checks whether the user is subscribed to given channel
     * @param channel Channel
     * @returns {boolean} `boolean`
     */
    isSubscribedToChannel(channel: Channel): boolean {
        return this.channels.has(channel);
    }

    /**
     * Adds a channel subscription
     * @param {Channel} channel
     */
    addChannelSubscription(channel: Channel) {
        return this.channels.add(channel);
    }

    /**
     * Removes a subscription on a channel and the event listeners assigned to it
     * @param {Channel} channel channel
     *
     * @returns {void}
     */
    removeChannelSubscription(channel: Channel): void {
        this.channels.delete(channel);
        this.removeChannelEvents(channel);
    }
}
