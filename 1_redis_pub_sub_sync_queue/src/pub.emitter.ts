import {EventEmitter} from "node:events";

class PubEmitter extends EventEmitter {

    constructor () {
        super();
    }

    update(contract: string, data: any) {
        const eventName = 'Publish::DataSyncEvent';
        const eventData = {
            contract: 'Location::Contracts::V2',
            date_of_truth: '2023-09-23', // updatedAt
            original_entity_id: 1,
            data: {
                id: 1,
                name: 'NY'
            }
        };
        this.emit(eventName, eventData);
    }
}

export default new PubEmitter();
