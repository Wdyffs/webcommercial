import data from './info.json'

class Data {
    constructor(data) {
        this._data = data
    }
    get getNav() {
        return this._data.nav
    }
}

export default new Data(data);
