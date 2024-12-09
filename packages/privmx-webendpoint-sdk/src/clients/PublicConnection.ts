import { EventDispatcher } from '../EventDispatcher';
import { InboxEntryPayload, InboxPublicView } from '../types/inboxes';
import { InboxClient } from './InboxClient';
import { Endpoint } from './Endpoint';

/**
 * Provides a wrapper for functions used in public connection ( created using `Endpoint.connectPublic).
 */
export class PublicConnection {
    constructor(private platform: Endpoint) {}

    /**
     * @returns {string} ID of current connection
     */
    public getConnectionId(): string {
        return this.platform.getConnectionId();
    }

    /**
     * Sends data and optional files to an Inbox.
     * @param {string} inboxId  ID of Inbox to send the entry to
     * @param {InboxEntryPayload} entry {@link InboxEntryPayload `InboxEntryPayload`} object
     * @returns {Promise<void>} a promise that resolves when the data and files have been successfully sent to the Inbox
     */
    async sendDataToInbox(inboxId: string, entry: InboxEntryPayload): Promise<void> {
        return await new InboxClient(inboxId, this.platform, new EventDispatcher()).sendData(entry);
    }

    /**
     * Fetches Inbox public view.
     * @param inboxId ID of Inbox to get public meta
     */
    async getInboxPublicView(inboxId: string): Promise<InboxPublicView> {
        return await new InboxClient(inboxId, this.platform, new EventDispatcher()).getPublicView();
    }
}
