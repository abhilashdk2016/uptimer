import { IMonitorResponse } from "@app/interfaces/monitor.interface";
import { MongoClient } from 'mongodb';

export const mongodbPing = async (connectionString: string): Promise<IMonitorResponse> => {
    const startTime: number = Date.now();
    return new Promise((resolve, reject) => {
        MongoClient.connect(connectionString)
        .then(async (client: MongoClient) => {
            await client.db().command({ ping : 1 });
            await client.close();
            resolve({
                status: 'established',
                responseTime: Date.now() - startTime,
                message: 'MongoDB Running',
                code: 200
            });
        })
        .catch(error => {
            if(error?.errorResponse)
            {
                reject({
                    status: 'refused',
                    responseTime: Date.now() - startTime,
                    message: error?.errorResponse?.errormsg ?? 'MongoDB Server connection issue',
                    code: error?.errorResponse?.code ?? 500
                });
            } else {
                reject({
                    status: 'refused',
                    responseTime: Date.now() - startTime,
                    message: 'MongoDB Server down',
                    code: 500
                });
            }
        });
    });
}