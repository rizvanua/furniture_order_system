mainApp.factory('Sync', function(Database, ModalService, fbUser, $http, $injector, Auth) {

    var service = {};

    service.GetBlobAccessKey = function() {
        var deferred = Q.defer();
        $http({
            method: 'GET',
            url: Config.API.Base + '/sync/BlobAccessToken'
        }).then(function(response) {
            var data = response.data;
            deferred.resolve(data);
        }, function(response) {
            var data = response.data;
            deferred.reject();
        });
        return deferred.promise;
    };

    var loadDoorDimData = function() {
        var deferred = Q.defer();

        $http({
            method: 'GET',
            url: Config.API.Base + '/sync/ExportWindowDims'
        }).then(function(response) {
            var data = response.data;
            Models.WindowDoorDims.findBy('DoorDimID', 1, function(obj) {
                if (obj === null) {
                    obj = new Models.WindowDoorDims({ DoorDimID: 1, JSON: JSON.stringify(data), DateLoaded: new Date() });
                    persistence.add(obj);
                } else {
                    obj.JSON = JSON.stringify(data);
                    obj.DateLoaded = new Date();
                }
                persistence.flush(function() {
                    deferred.resolve();
                });
            });
        }, function(response) {
            var data = response.data;
            deferred.reject();
        });

        return deferred.promise;
    };

    var loadMfConfigData = function() {
        var deferred = Q.defer();
        fbUser.CurrUser().then(function(user) {

            $http({
                method: 'POST',
                url: Config.API.Base + '/window/getMFConfigSync',
                data: {
                    userID: user.UserID
                }
            }).then(function(response) {
                var data = response.data;
                Models.WindowMfConfig.findBy('MfConfigID', 1, function(obj) {
                    if (obj === null) {
                        obj = new Models.WindowMfConfig({ MfConfigID: 1, JSON: JSON.stringify(data), DateLoaded: new Date() });
                        persistence.add(obj);
                    } else {
                        obj.JSON = JSON.stringify(data);
                        obj.DateLoaded = new Date();
                    }
                    persistence.flush(function() {
                        deferred.resolve();
                    });
                });
            }, function(response) {
                var data = response.data;
                deferred.reject();
            });

        });
        return deferred.promise;
    };

    var loadCoreWindowMfData = function(list, index) {
        var deferred = Q.defer();
        if (index < list.length) {
            var mf = list[index];
            $http({
                method: 'GET',
                url: Config.API.Base + '/window/getallwindows?mf=' + mf
            }).then(function(response) {
                var data = response.data;
                Models.WindowCoreData.findBy('Manufacturer', mf, function(obj) {
                    if (obj === null) {
                        obj = new Models.WindowCoreData({ Manufacturer: mf, JSON: JSON.stringify(data), DateLoaded: new Date() });
                        persistence.add(obj);
                    } else {
                        obj.JSON = JSON.stringify(data);
                        obj.DateLoaded = new Date();
                    }
                    loadCoreWindowMfData(list, index + 1).then(function() {
                        deferred.resolve();
                    });
                });
            }, function(response) {
                var data = response.data;
                deferred.reject();
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    var loadCoreWindowData = function() {
        var deferred = Q.defer();
        $http({
            method: 'GET',
            url: Config.API.Base + '/window/getwindowmfs'
        }).then(function(response) {
            var data = response.data;
            loadCoreWindowMfData(data, 0).then(function() {
                persistence.flush(function() {
                    deferred.resolve();
                });
            }, function() {
                deferred.reject();
            });
        }, function(response) {
            var data = response.data;
            deferred.reject();
        });
        return deferred.promise;
    };

    var loadObscureData = function() {
        var deferred = Q.defer();
        $http({
            method: 'GET',
            url: Config.API.Base + '/sync/ExportObscures'
        }).then(function(response) {
            var data = response.data;
            Models.WindowMfConfig.findBy('MfConfigID', 2, function(cfg) {
                if (cfg !== null) {
                    cfg.JSON = JSON.stringify(data);
                } else {
                    obj = new Models.WindowMfConfig({ MfConfigID: 2, JSON: JSON.stringify(data), DateLoaded: new Date() });
                    persistence.add(obj);
                }
                persistence.flush(function() {
                    deferred.resolve();
                });
            });
        }, function(response) {
            var data = response.data;
            deferred.reject();
        });
        return deferred.promise;
    };

    service.LoadWindowData = function() {
        var deferred = Q.defer();
        var load = function() {
            var deferred = Q.defer();
            loadCoreWindowData().then(function() {
                loadMfConfigData().then(function() {
                    loadDoorDimData().then(function() {
                        loadObscureData().then(function() {
                            deferred.resolve();
                        }, function() {
                            deferred.reject();
                        });
                    }, function() {
                        deferred.reject();
                    });
                }, function() {
                    deferred.reject();
                });
            }, function() {
                deferred.reject();
            });
            return deferred.promise;
        };
        $http({
            method: 'GET',
            url: Config.API.Base + '/sync/WindowDBLastUpdated'
        }).then(function(response) {
            var data = response.data;
            Models.WindowDBLastUpdated.findBy('WindowDataVersionID', 1, function(wdb) {
                if (wdb !== null) {
                    if (wdb.utcLastMod !== data.utcLastMod) {
                        load().then(function() {
                            wdb.utcLastMod = data.utcLastMod;
                            persistence.flush(function() {
                                deferred.resolve();
                            });
                        });
                    } else {
                        deferred.resolve();
                    }
                } else {
                    load().then(function() {
                        wdb = new Models.WindowDBLastUpdated({ WindowDataVersionID: 1, utcLastMod: data.utcLastMod });
                        persistence.add(wdb);
                        persistence.flush(function() {
                            deferred.resolve();
                        });
                    });
                }
            });
        }, function(response) {
            var data = response.data;
            deferred.reject();
        });
        return deferred.promise;
    };

    service.localCheck = (function() {
        var deferred = Q.defer();
        $http({
            method: 'GET',
            url: Config.Sync.LocalDataUrl + '/check.json'
        }).then(function(response) {
            var data = response.data;
            if (data.good) {
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }
        }, function(response) {
            var data = response.data;
            deferred.resolve(false);
        });
        return deferred.promise;
    })();

    var syncImage = function(image) {
        var deferred = Q.defer();

        var url = image.path;
        var deleted = image.Deleted;
        if (!deleted) {
            var endpoint = Config.Sync.Image.BlobHost;
            service.localCheck.then(function(useLocal) {
                if (useLocal) {
                    endpoint = Config.Sync.LocalDataUrl;
                }
                $http.get(endpoint + url, {
                        responseType: 'arraybuffer'
                    })
                    .success(function(response) {
                        (function(response) {
                            var deferred = Q.defer();
                            Models.ImageDatabase.findBy('ImgUrl', url, function(obj) {
                                if (obj === null) {
                                    obj = new Models.ImageDatabase({
                                        ImgUrl: url,
                                        Base64: base64ArrayBuffer(response)
                                    });
                                    persistence.add(obj);
                                    deferred.resolve(obj);
                                } else {
                                    obj.Base64 = base64ArrayBuffer(response);
                                    deferred.resolve(obj);
                                }
                            });
                            return deferred.promise;
                        })(response).then(function(newImg) {
                            Models.ImageVersions.findBy('ImageVersionID', image.ImageVersionID, function(obj) {
                                if (obj === null) {
                                    obj = new Models.ImageVersions(image);
                                    persistence.add(obj);
                                } else {
                                    obj = _.extend(obj, image);
                                }
                                persistence.flush(function() {
                                    delete persistence.trackedObjects[obj.id];
                                    delete persistence.trackedObjects[newImg.id];
                                    deferred.resolve();
                                });
                            });
                        });
                    }).error(function(response) {
                        deferred.resolve();
                    });
            });
        } else {
            Models.ImageVersions.findBy('ImageVersionID', image.ImageVersionID, function(obj) {
                if (obj === null) {
                    obj = new Models.ImageVersions(image);
                    persistence.add(obj);
                } else {
                    obj = _.extend(obj, image);
                }
                persistence.flush(function() {
                    delete persistence.trackedObjects[obj.id];
                    deferred.resolve();
                });
            });
        }

        return deferred.promise;
    };

    service.syncImages = function() {
        var deferred = Q.defer();

        Models.ImageVersions.all().order('SyncVersion', false).one(null, function(last) {
            var lastVersion = 0;
            if (last !== null) {
                lastVersion = last.SyncVersion;
            }

            $http({
                method: 'GET',
                url: Config.API.Base + '/Sync/ImageVersions' + '?since=' + lastVersion
            }).then(function(response) {
                var data = response.data;
                var q = async.queue(function(image, callback) {
                    $('body').trigger({
                        type: 'fb_syncing_image_processed',
                        url: image.path,
                        progress: 100 - ((q.length() / data.updates.length) * 100),
                        index: data.updates.length - q.length(),
                        length: data.updates.length
                    });
                    syncImage(image).then(function() {
                        callback({ error: false });
                    }, function() {
                        callback({ error: true });
                    });
                }, 10);

                q.drain = function() {
                    service.SetLastSync(Config.Sync.Image.Tag).then(function() {
                        console.log("Image Sync Done");
                        deferred.resolve();
                    });
                    $('body').trigger({
                        type: 'fb_syncing_image_done'
                    });
                };

                q.push(data.updates, function(data) {
                    if (data.error) {
                        console.log("IMAGE SYNC ERROR");
                        q.kill();
                        deferred.reject();
                    }
                });
            }, function(response) {
                var data = response.data;
                deferred.reject();
            });

        });

        return deferred.promise;
    };

    service.basicSyncList = function(list, first) {

        var deferred = Q.defer();

        var q = async.queue(function(task, callback) {
            $('body').trigger({
                type: 'fb_syncing_basic_progress',
                progress: 100 - ((q.length() / list.length) * 100)
            });
            service.basicSync(task, true, first).then(function() {
                callback({ error: false });
            }, function() {
                callback({ error: true });
            });
        }, 1);

        q.drain = function() {
            service.SetLastSync(1).then(function() {
                $('body').trigger({
                    type: 'fb_syncing_basic_done',
                });
                console.log("Basic Sync Done");
                deferred.resolve();
            });
        };

        q.push(list, function(data) {
            if (data.error) {
                console.log("BS ERROR");
                q.kill();
                deferred.reject();
            }
        });

        return deferred.promise;
    };

    service.twoWaySyncList = function(list, first) {

        var deferred = Q.defer();

        var q = async.queue(function(task, callback) {
            $('body').trigger({
                type: 'fb_syncing_two_way_progress',
                progress: 100 - ((q.length() / list.length) * 100)
            });
            service.twoWaySync(task, first).then(function() {
                callback({ error: false });
            }, function() {
                callback({ error: true });
            });
        }, 1);

        q.drain = function() {
            service.SetLastSync(2).then(function() {
                $('body').trigger({
                    type: 'fb_syncing_two_way_done',
                });
                console.log("Two-Way Sync Done");
                deferred.resolve();
            });
        };

        q.push(list, function(data) {
            if (data.error) {
                console.log("TWO-WAY ERROR");
                q.kill();
                deferred.reject();
            }
        });

        return deferred.promise;
    };

    service.pushItem = function(syncItem, entity) {

        var deferred = Q.defer();

        var create = (syncItem[entity.index] === 0);

        var pWait = [];

        entity.ref.forEach(function(ref) {
            pWait.push(service.checkRecord(syncItem, ref));
        });

        Q.allSettled(pWait).then(function(results) {

            $http({
                method: 'POST',
                url: Config.API.Base + '/Sync/' + entity.name,
                data: syncItem._data
            }).then(function(response) {
                var data = response.data;
                if (data.code === 1) {
                    $http({
                        method: 'POST',
                        url: Config.API.Base + '/Sync/' + entity.name + "Force",
                        data: syncItem._data
                    }).then(function(response) {
                        var data = response.data;
                        syncItem.Sync = false;
                        deferred.resolve();
                    }, function(response) {
                        var data = response.data;
                        deferred.reject();
                    });
                } else {
                    if (create) {
                        console.log("Created New And Linked!");

                        var pWait = [];

                        syncItem[entity.index] = data.entity[entity.index];

                        entity.dep.forEach(function(dep) {
                            pWait.push(service.updateDep(syncItem, data.entity, dep));
                        });

                        Q.allSettled(pWait).then(function() {
                            syncItem.Sync = false;
                            deferred.resolve();
                        });

                    } else {
                        console.log("Pushed Change!");

                        syncItem.Sync = false;
                        deferred.resolve();
                    }
                }
            }, function(response) {
                var data = response.data;
                if (response.status === 500) {
                    ModalService.showModal({
                        templateUrl: 'components/modals/confirm-modal/confirm-modal.html',
                        controller: "ConfirmModalController",
                        inputs: {
                            customer: null,
                            heading: "A Critical Sync Error Occured",
                            body: "A critical sync error has occured, this is usually a sign of data corruption. Please use the \"Clear Database\" option" +
                                " in the offline managment console to resolve this issue"
                        }
                    }).then(function(modal) {
                        modal.element.modal();
                        modal.close.then(function(res) {});
                    });
                }
                deferred.reject();
            });

        });

        return deferred.promise;

    };

    service.twoWaySync = function(entity, first) {

        var deferred = Q.defer();

        if (first) {
            service.basicSync(entity, false, true).then(function() {
                deferred.resolve();
            }, function() {
                deferred.reject();
            });
        } else {
            entity.model.all().filter('Sync', '=', true).list(null, function(syncItems) {

                var pWait = [];

                syncItems.forEach(function(syncItem, index, array) {

                    pWait.push(service.pushItem(syncItem, entity));

                });

                Q.allSettled(pWait).then(function(results) {
                    var success = true;
                    results.forEach(function(result) {
                        if (result.state !== "fulfilled") {
                            success = false;
                        }
                    });
                    if (success) {
                        service.basicSync(entity, false, false).then(function() {
                            deferred.resolve();
                        }, function() {
                            deferred.reject();
                        });
                    } else {
                        deferred.reject();
                    }
                });

            });
        }

        return deferred.promise;
    };

    service.addRecord = function(element, entity) {
        var deferred = Q.defer();
        var rec = new entity.model(element);
        persistence.add(rec);
        if (entity.ref !== undefined) {

            var pWait = [];

            entity.ref.forEach(function(element, index, array) {
                pWait.push(service.updateRef(rec, rec, element));
            });

            Q.allSettled(pWait).then(function() {
                deferred.resolve();
            });

        } else {
            deferred.resolve();
        }

        return deferred.promise;
    };


    service.processData = function(data, first, entity, trueBasic) {

        var pWait = [];

        var deferred = Q.defer();

        data.updates.forEach(function(element, index, array) {
            pWait.push((function() {
                var deferred = Q.defer();
                if (!first) {
                    entity.model.findBy(entity.index, element[entity.index], function(obj) {
                        if (obj !== null) {
                            if (entity.ref !== undefined && entity.ref.length === 0) {
                                _.extend(obj, element);
                                deferred.resolve();
                            } else {
                                var oWait = [];
                                if (entity.ref !== undefined) {
                                    entity.ref.forEach(function(ref, index, array) {
                                        oWait.push((function(ref) {
                                            var deferred = Q.defer();
                                            if (obj[ref.remote] !== element[ref.remote]) {
                                                service.updateRef(obj, element, ref).then(function() {
                                                    deferred.resolve();
                                                });
                                            } else {
                                                deferred.resolve();
                                            }
                                            return deferred.promise;
                                        })(ref));
                                    });
                                }
                                Q.allSettled(oWait).then(function() {
                                    _.extend(obj, element);
                                    deferred.resolve();
                                });
                            }
                        } else {
                            service.addRecord(element, entity).then(function() {
                                deferred.resolve();
                            });
                        }
                    });
                } else {
                    service.addRecord(element, entity).then(function() {
                        deferred.resolve();
                    });
                }
                return deferred.promise;
            })());
        });

        Q.allSettled(pWait).then(function() {
            persistence.flush(function() {
                _.each(persistence.trackedObjects, function(value, key) {
                    if (value._type === entity.name) {
                        delete persistence.trackedObjects[key];
                    }
                });
                if (data.updates.length > 0) {
                    deferred.resolve(false);
                } else {
                    deferred.resolve(true);
                }
            });
        });

        return deferred.promise;

    };


    service.processFiles = function(files, first, entity, trueBasic, blobInfo) {
        var deferred = Q.defer();

        var q = async.queue(function(file, callback) {
            if (trueBasic) {
                $('body').trigger({
                    type: 'fb_syncing_basic',
                    index: ((files.files.length * files.Chunking) - (files.Chunking * q.length())),
                    name: entity.name,
                    chunk: files.Chunking
                });
            } else {
                $('body').trigger({
                    type: 'fb_syncing_two_way',
                    index: ((files.files.length * files.Chunking) - (files.Chunking * q.length())),
                    name: entity.name,
                    chunk: files.Chunking
                });
            }
            Auth.OnAuthSet().then(function(authInfo) {
                var endpoint = 'https://fbcompanystorage.blob.core.windows.net/company-' + authInfo.companyId + "/core/" + blobInfo.version;
                service.localCheck.then(function(useLocal) {
                    if (useLocal) {
                        endpoint = Config.Sync.LocalDataUrl + "/core/";
                    }
                    $http({
                        method: 'GET',
                        url: endpoint + "/" + file + blobInfo.key
                    }).then(function(response) {
                        var data = response.data;
                        service.processData(data, first, entity, trueBasic).then(function() {
                            callback({ error: false });
                        });
                    }, function(response) {
                        var data = response.data;
                        console.log(data);
                        callback({ error: true });
                    });
                });
            });
        }, 1);

        q.drain = function() {
            deferred.resolve();
        };

        q.push(files.files, function(data) {
            if (data.error) {
                console.log("BS ERROR");
                q.kill();
                deferred.reject();
            }
        });

        return deferred.promise;
    };

    service.basicSync = function(entity, trueBasic, first) {

        var deferred = Q.defer();

        if (first) {
            entity.model.all().destroyAll(function() {
                service.GetBlobAccessKey().then(function(blobInfo) {
                    Auth.OnAuthSet().then(function(authInfo) {
                        var endpoint = 'https://fbcompanystorage.blob.core.windows.net/company-' + authInfo.companyId + "/core/" + blobInfo.version;
                        service.localCheck.then(function(useLocal) {
                            if (useLocal) {
                                endpoint = Config.Sync.LocalDataUrl + "/core/";
                            }
                            $http({
                                method: 'GET',
                                url: endpoint + "/" + entity.name + ".json" + blobInfo.key,
                            }).then(function(response) {
                                var data = response.data;
                                service.processFiles(data, first, entity, trueBasic, blobInfo).then(function() {
                                    deferred.resolve();
                                });
                            }, function(response) {
                                var data = response.data;
                                console.log(data);
                                deferred.reject();
                            });
                        });
                    });
                }, function() {
                    deferred.reject();
                });
            });
        } else {
            var res = entity.model.all().order('SyncVersion', false).one(null, function(last) {
                var lastVersion = 0;
                if (last !== null) {
                    lastVersion = last.SyncVersion;
                }

                var rLimit = Config.Sync.Basic.RecordLimit;
                if (entity.chunk !== undefined && entity.chunk !== null) {
                    rLimit = entity.chunk;
                }

                $http({
                    method: 'GET',
                    url: Config.API.Base + '/Sync/' + entity.name + '?since=' + lastVersion + '&limit=' + rLimit,
                }).then(function(response) {
                    var dp = {};
                    dp.dataPermissionsChanged = false;
                    var data = response.data;
                    if (trueBasic && entity.name === "DataPermissions") {
                        if (data.updates.length > 0) {
                            data.updates.forEach(function(obj) {
                                if (!obj.Hidden) {
                                    dp.dataPermissionsChanged = true;
                                }
                            });
                            if (dp.dataPermissionsChanged) {
                                dp.clear = service.ClearLastSync(Config.Sync.Basic.Tag);
                            }
                        }
                    }
                    service.processData(data, first, entity, trueBasic).then(function(done) {
                        if (!done) {
                            service.basicSync(entity, trueBasic, first).then(function() {
                                if (dp.dataPermissionsChanged) {
                                    OnTwoWaySyncDone().then(function() {
                                        dp.clear.then(function() {
                                            location.reload();
                                        });
                                    });
                                } else {
                                    deferred.resolve();
                                }
                            }, function() {
                                if (dp.dataPermissionsChanged) {
                                    OnTwoWaySyncDone().then(function() {
                                        dp.clear.then(function() {
                                            location.reload();
                                        });
                                    });
                                } else {
                                    deferred.reject();
                                }
                            });
                        } else {
                            if (dp.dataPermissionsChanged) {
                                OnTwoWaySyncDone().then(function() {
                                    dp.clear.then(function() {
                                        location.reload();
                                    });
                                });
                            } else {
                                deferred.resolve();
                            }
                        }
                    });
                }, function(response) {
                    var data = response.data;
                    console.log(data);
                    deferred.reject();
                });

            });
        }

        return deferred.promise;
    };

    service.checkRecord = function(rec, ref) {
        var deferred = Q.defer();
        var trueRemote = ref.trueRemote || ref.remote;
        if ((rec[ref.remote] === undefined || rec[ref.remote] === null || rec[ref.remote] === 0 || rec[ref.remote] === "") &&
            (rec[ref.local] !== undefined && rec[ref.local] !== null && rec[ref.local] !== "" && rec[ref.local] !== 0)) {
            ref.model.findBy('id', rec[ref.local], function(obj) {
                if (obj !== null) {
                    rec[ref.remote] = obj[trueRemote];
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    };

    service.updateRef = function(obj, uObj, ref) {
        var deferred = Q.defer();
        var trueRemote = ref.trueRemote || ref.remote;
        ref.model.findBy(trueRemote, uObj[ref.remote], function(parent) {
            if (parent !== null) {
                obj[ref.local] = parent.id;
            }
            deferred.resolve();
        });
        return deferred.promise;
    };

    service.updateDep = function(obj, uObj, dep) {
        var deferred = Q.defer();
        var trueRemote = dep.trueRemote || dep.remote;
        dep.model.all().filter(dep.local, '=', obj.id).list(function(children) {
            children.forEach(function(child) {
                child[dep.remote] = uObj[trueRemote];
            });
            deferred.resolve();
        });
        return deferred.promise;
    };

    service.ClearLastSync = function(id) {
        var deferred = Q.defer();
        Models.LastSync.findBy('LastSyncID', id, function(lastSync) {
            if (lastSync !== null) {
                persistence.remove(lastSync);
            }
            persistence.flush(function() {
                deferred.resolve();
            });
        });
        return deferred.promise;
    };

    service.SetLastSync = function(id) {
        var deferred = Q.defer();
        Models.LastSync.findBy('LastSyncID', id, function(lastSync) {
            if (lastSync === null) {
                var ls = new Models.LastSync({
                    LastSyncID: id,
                    SDate: new Date()
                });
                persistence.add(ls);
            } else {
                lastSync.SDate = new Date();
            }
            persistence.flush(function() {
                deferred.resolve();
            });
        });
        return deferred.promise;
    };

    service.GetLastSync = function(id) {
        var deferred = Q.defer();
        Models.LastSync.findBy('LastSyncID', id, function(lastSync) {
            deferred.resolve(lastSync);
        });
        return deferred.promise;
    };

    service.isFirstSync = (function() {
        var deferred = Q.defer();
        Database.ready().then(function() {
            service.GetLastSync(1).then(function(lastSync) {
                service.GetLastSync(2).then(function(lastSyncTwoWay) {
                    service.GetLastSync(3).then(function(lastSyncWindow) {
                        service.GetLastSync(4).then(function(lastSyncImg) {
                            deferred.resolve(lastSync === null || lastSyncTwoWay === null || lastSyncWindow === null || lastSyncImg === null);
                        });
                    });
                });
            });
        });
        return deferred.promise;
    })();

    service.TimeBomb = function(set) {
        var deferred = Q.defer();
        var today = new Date();
        if (set) {
            var timeBomb = new Models.TimeBomb({
                TimeBombID: 1,
                Date: new Date()
            });
            persistence.add(timeBomb);
            persistence.flush(function() {
                deferred.resolve();
            });
        } else {
            Models.TimeBomb.findBy('TimeBombID', 1, function(timeBomb) {
                if (timeBomb === null) {
                    timeBomb = new Models.TimeBomb({
                        TimeBombID: 1,
                        Date: new Date()
                    });
                    persistence.add(timeBomb);
                    persistence.flush(function() {
                        deferred.resolve();
                    });
                } else {
                    var uid = localStorage.getItem("userID");
                    if (timeBomb.Date.getTime() + Config.Sync.TimeBombLength < today.getTime() && (uid !== undefined || uid !== null || uid !== 0 || uid !== "")) {
                        var Auth = $injector.get('Auth');
                        Auth.logOut();
                        location.reload();
                        deferred.resolve();
                    }
                }
            });
        }
        return deferred.promise;
    };

    service.ClearDB = function() {
        var deferred = Q.defer();
        var pWait = [];
        Models.SyncListTwoWay.forEach(function(entity) {
            pWait.push((function() {
                var deferred = Q.defer();
                entity.model.all().destroyAll(function() {
                    persistence.flush(function() {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            })());
        });
        Models.SyncListBasic.forEach(function(entity) {
            pWait.push((function() {
                var deferred = Q.defer();
                entity.model.all().destroyAll(function() {
                    persistence.flush(function() {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            })());
        });
        pWait.push((function() {
            var deferred = Q.defer();
            Models.LastSync.all().destroyAll(function() {
                persistence.flush(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        })());
        pWait.push((function() {
            var deferred = Q.defer();
            Models.WindowDBLastUpdated.all().destroyAll(function() {
                persistence.flush(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        })());
        pWait.push((function() {
            var deferred = Q.defer();
            Models.ImageVersions.all().destroyAll(function() {
                persistence.flush(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        })());
        pWait.push((function() {
            var deferred = Q.defer();
            Models.ImageDatabase.all().destroyAll(function() {
                persistence.flush(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        })());
        Q.allSettled(pWait).then(function() {
            deferred.resolve();
        });
        return deferred.promise;
    };

    var startBasicSyncService = function() {
        async.forever(
            function(next) {
                service.GetLastSync(Config.Sync.Basic.Tag).then(function(lastSync) {
                    var first = (lastSync === null);
                    service.basicSyncList(Models.SyncListBasic, first).then(function() {
                        setTimeout(function() {
                            next();
                        }, Config.Sync.Basic.Interval);
                    }, function() {
                        setTimeout(function() {
                            next();
                        }, Config.Sync.Basic.Interval);
                    });
                });
            },
            function(err) {
                console.log("This should not happen...");
            }
        );
    };

    var twoWaySyncListeners = [];

    var OnTwoWaySyncDone = function() {
        var deferred = Q.defer();
        twoWaySyncListeners.push(deferred);
        return deferred.promise;
    };

    var TwoWaySyncDone = function() {
        twoWaySyncListeners.forEach(function(deferred) {
            deferred.resolve();
        });
    };

    var startTwoWaySyncService = function() {
        async.forever(
            function(next) {
                service.GetLastSync(Config.Sync.TwoWay.Tag).then(function(lastSync) {
                    var first = (lastSync === null);
                    service.twoWaySyncList(Models.SyncListTwoWay, first).then(function() {
                        TwoWaySyncDone();
                        setTimeout(function() {
                            next();
                        }, Config.Sync.TwoWay.Interval);
                    }, function() {
                        TwoWaySyncDone();
                        setTimeout(function() {
                            next();
                        }, Config.Sync.TwoWay.Interval);
                    });
                });
            },
            function(err) {
                console.log("This should not happen...");
            }
        );
    };

    var startImageSyncService = function() {
        async.forever(
            function(next) {
                service.syncImages().then(function() {
                    setTimeout(function() {
                        console.log("Image Sync Done");
                        next();
                    }, Config.Sync.Image.Interval);
                }, function() {
                    setTimeout(function() {
                        console.log("Image Sync Fail");
                        next();
                    }, Config.Sync.Image.Interval);
                });
            },
            function(err) {
                console.log("This should not happen...");
            }
        );
    };

    var startWindowSyncService = function() {
        async.forever(
            function(next) {
                service.LoadWindowData().then(function() {
                    setTimeout(function() {
                        service.SetLastSync(Config.Sync.WindowData.Tag).then(function() {
                            console.log("Window Data Loaded");
                            $('body').trigger({
                                type: 'fb_syncing_window_done',
                            });
                            next();
                        });
                    }, Config.Sync.WindowData.Interval);
                }, function() {
                    setTimeout(function() {
                        console.log("Window Data Fail");
                        next();
                    }, Config.Sync.WindowData.Interval);
                });
            },
            function(err) {
                console.log("This should not happen...");
            }
        );
    };

    var init = function() {
        Auth.OnAuthSet().then(function(authInfo) {
            startBasicSyncService();
            startTwoWaySyncService();
            startImageSyncService();
            startWindowSyncService();
            setTimeout(function() {
                service.TimeBomb(false);
            }, 1000 * 60);
        });
    };

    Database.ready().then(function() {
        init();
    });

    return service;

});