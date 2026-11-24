import { client } from "$services/redis";
import { usersLikesKey, itemsKey} from "$services/keys";
import { getItem, getItems } from "./items";

export const userLikesItem = async (itemId: string, userId: string) => {

    return client.sIsMember(usersLikesKey(userId), itemId)
};

export const likedItems = async (userId: string) => {

    //trae todas las ids de los items de este usuario a los que le ha dado like
    const ids = await client.sMembers(usersLikesKey(userId))

    //trae todos los hashes de los items con esos ids y los retorna como un arreglo
    return getItems(ids);
};

export const likeItem = async (itemId: string, userId: string) => {

   const inserted = await client.sAdd(usersLikesKey(userId), itemId)

   if (inserted){

    return client.hIncrBy(itemsKey(itemId), 'likes', 1)

   }
};

export const unlikeItem = async (itemId: string, userId: string) => {

    const removed = await client.sRem(usersLikesKey(userId), itemId)

    if (removed) {
        return client.hIncrBy(itemsKey(itemId), 'likes', -1)
    }
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {

const ids = await client.sInter([usersLikesKey(userOneId), usersLikesKey(userTwoId)]);

return getItems(ids);

};
