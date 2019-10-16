
export const sortEvents = (obj1, obj2)=>{
    if (obj1.blockNumber > obj2.blockNumber) {
        return 1;
    }

    if (obj1.blockNumber < obj2.blockNumber) {
        return -1;
    }

    return 0;
};