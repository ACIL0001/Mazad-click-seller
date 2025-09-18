import { requests } from "./utils";

export const BidsCheck = {
    checkBids: (id): Promise<any> => requests.post('/bid/check', id),
}