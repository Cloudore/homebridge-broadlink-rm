const sendData = require('../helpers/sendData');
const delayForDuration = require('../helpers/delayForDuration');
const BroadlinkRMAccessory = require('./accessory');

class SwitchRepeatAccessory extends BroadlinkRMAccessory {

  async setSwitchState (hexData) {
    if (hexData) this.performSend(hexData);
  }

  async performSend (data) {
    const { config, host, log, name } = this;
    let { disableAutomaticOff, interval, sendCount } = config;

    interval = interval || 1;

    // Itterate through each hex config in the array
    for (let index = 0; index < sendCount; index++) {
      sendData({ host, hexData: data, log, name });

      if (index < sendCount - 1) await delayForDuration(interval);
    }

    if (!disableAutomaticOff) {
      await delayForDuration(0.1);

      this.switchService.setCharacteristic(Characteristic.On, 0);
    }
  }

  getServices () {
    const services = super.getServices();
    const { data, name } = this;

    const service = new Service.Switch(name);
    this.addNameService(service);

    this.createToggleCharacteristic({
      service,
      characteristicType: Characteristic.On,
      propertyName: 'switchState',
      onHex: Array.isArray(data) ? data : data.on,
      offHex: Array.isArray(data) ? undefined : data.off,
      setValuePromise: this.setSwitchState.bind(this)
    });

    services.push(service);

    this.switchService = service;

    return services;
  }
}

module.exports = SwitchRepeatAccessory;
