module.exports = class mqtt_info{
    constructor(){
        this.poort = 34309;
        this.clientID = Math.floor(Math.random()* 10001);
        this.hostnaam = "m20.cloudmqtt.com";
        this.username = "korneel";
        this.password = "admin";
    }
}