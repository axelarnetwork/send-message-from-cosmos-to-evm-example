use cosmwasm_schema::cw_serde;
use cw_storage_plus::Item;

pub const CONFIG: Item<Config> = Item::new("send_receive");

#[cw_serde]
pub struct Config {
    pub channel: String,
}

#[cw_serde]
pub struct Message {
    pub sender: String,
    pub message: String,
}

pub const STORED_MESSAGE: Item<Message> = Item::new("storedmessage");
