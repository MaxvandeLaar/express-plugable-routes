const chokidar = require('chokidar');
const fs = require('fs');
const Loki = require('lokijs');

class ExpressPlugableRoutes {
    constructor(app, addonFolder, watchFor, opts = {}, error404 = null, errorHandler = null) {
        this.db = new Loki('ExpressPlugableRoutes');
        this.plugins = this.db.addCollection('plugins', {unique: ['name']});

        const watcher = chokidar.watch(watchFor, opts);

        if (error404 !== null) {
            Object.defineProperty(error404, 'name', {value: 'error404'});
        }
        if (errorHandler !== null) {
            Object.defineProperty(errorHandler, 'name', {value: 'errorHandler'});
        }

        const self = this;

        watcher
            .on('add', function (path) {
                console.log('File', path, 'has been added');
                self.disableErrors(app, error404, errorHandler);
                const config = JSON.parse(fs.readFileSync(path, 'utf8'));
                self.register(app, config, addonFolder, path);
                self.enableErrors(app, error404, errorHandler);
                self.saveData();
            })
            .on('change', function (path) {
                console.log('File', path, 'has been changed');
                self.deregister(app, path);

                self.disableErrors(app, error404, errorHandler);
                const config = JSON.parse(fs.readFileSync(path, 'utf8'));
                self.register(app, config, addonFolder, path);
                self.enableErrors(app, error404, errorHandler);
                self.saveData();
            })
            .on('unlink', function (path) {
                console.log('File', path, 'has been removed');
                self.deregister(app, path);
                self.saveData();
            })
            .on('error', function (error) {
                console.error('Error happened', error);
            });
    }

    register(app, config, addonFolder, path) {
        let erpConfig = config.expressPlugableRoutes;
        const route = require(`${addonFolder}/${erpConfig.rootFolder}/${erpConfig.main ? erpConfig.main : config.main}`);
        Object.defineProperty(route, 'name', {value: erpConfig.name ? erpConfig.name : config.name});
        app.use(erpConfig.path, route);
        const plugins = this.plugins.find({name: {$eq: erpConfig.name? erpConfig.name : config.name}});
        erpConfig.configFile = path;
        if (plugins.length === 0){
            this.plugins.insert(erpConfig);
        } else {
            this.plugins.update(erpConfig);
        }
    }

    saveData(){
        this.db.saveDatabase();
    }

    deregister(app, path) {
        const plugins = this.plugins.find({configFile: {$eq: path}});
        let plugin = null;
        if (plugins.length > 0){
            plugin = plugins[0];
        }
        if (!plugin){
            return;
        }
        if (plugin) {
            this.removeByName(app, plugin.name);
        }
        this.plugins.remove(plugin);
    }

    removeByName(app, name) {
        app._router.stack = app._router.stack.filter(item => item.name !== name);
    }

    disableErrors(app, error404, errorHandler) {
        if (error404 !== null) {
            this.removeByName(app, 'error404');
        }

        if (errorHandler !== null) {
            this.removeByName(app, 'errorHandler');
        }
    }

    enableErrors(app, error404, errorHandler) {
        if (error404 !== null) {
            app.use(error404);
        }
        if (errorHandler !== null) {
            app.use(errorHandler);
        }
    }
}

module.exports = ExpressPlugableRoutes;