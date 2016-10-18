mainApp.factory('fbUser', function(Database, fbLoading, $http) {

    var service = {};

    service._userSet = Q.defer();

    service.CurrUser = function() {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (localStorage.getItem("userID") === null) {
                    service._userSet.promise.then(function() {
                        Models.Users.findBy('UserID', localStorage.getItem("userID"), function(user) {
                            Models.Companies.findBy('CompanyID', user.CompanyID, function(company) {
                                if (company !== null) {
                                    user.companyImagePath = Config.UPaths.CompanyImagePath + company.CompanyID + ".png";
                                    user.company = company;
                                }
                                service._user = user;
                                deferred.resolve(service._user);
                            });
                        });
                    });
                } else {
                    Models.Users.findBy('UserID', localStorage.getItem("userID"), function(user) {
                        if (user === null) {
                            deferred.reject();
                        } else {
                            Models.Companies.findBy('CompanyID', user.CompanyID, function(company) {
                                if (company !== null) {
                                    user.companyImagePath = Config.UPaths.CompanyImagePath + company.CompanyID + ".png";
                                    user.company = company;
                                }
                                service._user = user;
                                deferred.resolve(service._user);
                            });
                        }
                    });
                }
            });
        } else {
            var get = function(userId) {
                var deferred = Q.defer();
                $http.post(Config.API.Endpoints.User.CurrUser, { userID: userId }).then(function(data) {
                    service._user = data.data;
                    // fuck this shit, why...
                    service._user.UserID = service._user.userID;
                    service._user.companyImagePath = Config.UPaths.CompanyImagePath + service._user.companyID + ".png";
                    deferred.resolve(service._user);
                }, function() {
                    deferred.reject();
                });
                return deferred.promise;
            };
            if (localStorage.getItem("userID") === null) {
                service._userSet.promise.then(function() {
                    get(localStorage.getItem("userID")).then(function(user) {
                        deferred.resolve(user);
                    });
                });
            } else {
                get(localStorage.getItem("userID")).then(function(user) {
                    deferred.resolve(user);
                });
            }
        }
        return deferred.promise;
    };

    service.UserSet = function() {
        var deferred = Q.defer();
        if (localStorage.getItem("userID") !== null) {
            deferred.resolve(true);
            return deferred.promise;
        } else {
            return service._userSet.promise;
        }
    };

    service.SetUser = function(userID) {
        localStorage.setItem("userID", userID);
        service._userSet.resolve();
    };

    service.GetPermittedMfs = function(productID) {
        var deferred = Q.defer();
        var res = [];
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                service.CurrUser().then(function(user) {
                    Models.DataPermissions.all().filter('CompanyID', '=', user.company.CompanyID).list(function(dps) {
                        var pWait = [];
                        dps.forEach(function(dp) {
                            pWait.push((function() {
                                var deferred = Q.defer();
                                Models.Manufacturers.findBy('ManufacturerID', dp.ManufacturerID, function(manufacturer) {
                                    if (manufacturer.ProdutTypeID === productID) {
                                        res.push(manufacturer);
                                    }
                                    deferred.resolve();
                                });
                                return deferred.promise;
                            })());
                        });
                        Q.allSettled(pWait).then(function() {
                            deferred.resolve(res);
                        });
                    });
                });
            });
        } else {
            service.CurrUser().then(function(user) {
                $http.post(Config.API.Endpoints.User.GetPermittedMfs, { userID: user.UserID }).then(function(data) {
                    deferred.resolve(data.data);
                }, function() {
                    deferred.reject();
                });
            });
        }
        return deferred.promise;
    };

    service.GetUserPermissions = function(userId) {
        var deferred = Q.defer();
        Database.ready().then(function() {
            Models.Users.findBy('UserID', userId, function(user) {
                Models.CompanyProductPermissions.all().filter('CompanyID', '=', user.CompanyID).list(function(cpps) {
                    deferred.resolve(cpps);
                });
            });
        });
        return deferred.promise;
    };

    service.RelatedUsersContains = function(rUsers, userId) {
        for (var i = 0; i < rUsers.length; i++) {
            if (rUsers[i].UserID === userId) {
                return true;
            }
        }
        return false;
    };

    service.RelatedUsers = function(userId) {

        var deferred = Q.defer();

        Database.ready().then(function() {
            Models.UserGroups.all().filter('UserID', '=', userId).list(function(userGroups) {
                var users = [];
                var pWait = [];
                userGroups.forEach(function(group) {
                    pWait.push((function() {
                        var deferred = Q.defer();
                        Models.UserGroups.all().filter('GroupID', '=', group.GroupID).list(function(groupUsers) {
                            var pWait = [];
                            groupUsers.forEach(function(groupUser) {
                                pWait.push((function(groupUser) {
                                    var deferred = Q.defer();
                                    Models.Users.findBy('UserID', groupUser.UserID, function(user) {
                                        if (user !== null) {
                                            users.push(_.extend(groupUser._data, user._data));
                                        }
                                        deferred.resolve();
                                    });
                                    return deferred.promise;
                                })(groupUser));
                            });
                            Q.allSettled(pWait).then(function() {
                                deferred.resolve();
                            });
                        });
                        return deferred.promise;
                    })());
                });
                Q.allSettled(pWait).then(function() {
                    deferred.resolve(_.uniq(users, false, function(item, key) {
                        return item.UserID.toString() + ' ' + item.GroupID.toString();
                    }));
                });
            });
        });

        return deferred.promise;

    };

    service.GetCustomers = function(userId) {
		console.log(userId);
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Customers.all().filter('UserID', '=', userId).and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(customers) {
                    if (customers.length === 0) {
                        var customer = {
                            isAutoSaveCustomer: true,
                            name: "Auto Save",
                            createdAt: Date.now().toString(),
                            UserID: userId
                        };
                        Models.Create(Models.Customers, customer).then(function(rec) {
                            customers.push(rec);
                            deferred.resolve(customers);
                        });
                    } else {
                        deferred.resolve(customers);
                    }
                });
            });
        } else {
            $http.post(Config.API.Endpoints.User.GetCustomers, { id: userId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };

    service.GetCustomersForUsers = function(users, userId) {
        var deferred = Q.defer();

        var customers = [];
        var pWait = [];

        Database.ready().then(function() {

            users.forEach(function(user) {

                pWait.push((function() {
                    var deferred = Q.defer();
                    Models.Customers.all().filter('UserID', '=', user.UserID).and(new persistence.PropertyFilter('UserID', '!=', userId)).list(function(lCustomers) {
                        customers = customers.concat(lCustomers);
                        deferred.resolve();
                    });
                    return deferred.promise;
                })());

            });

            Q.allSettled(pWait).then(function() {
                deferred.resolve(customers);
            });

        });

        return deferred.promise;
    };

    service.AllCustomerInfo = function(userId) {

        var deferred = Q.defer();

        var res = {};
        res.Customers = [];
        res.CustomerMasterQuotes = [];
        res.CustomerDoorQuotes = [];

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {

                Models.Users.findBy('UserID', userId, function(user) {
                    if (user !== null) {
                        res.UserEmail = user.Email;
                        (function() {
                            var deferred = Q.defer();
                            Models.Companies.all().filter('CompanyID', '=', user.CompanyID).list(function(companies) {
                                deferred.resolve(companies);
                            });
                            return deferred.promise;
                        })().then(function(companies) {
                            (function() {
                                var deferred = Q.defer();
                                Models.CompanyProductPermissions.all().filter('CompanyID', '=', user.CompanyID).list(function(companiesPP) {
                                    deferred.resolve(companiesPP);
                                });
                                return deferred.promise;
                            })().then(function(companiesPP) {
                                res.CompanyProductPermissions = companiesPP;
                                service.RelatedUsers(userId).then(function(relatedUsers) {
                                    if (relatedUsers.length > 0) {
                                        res.UserDetails = relatedUsers;
                                    } else {
                                        res.UserDetails = [{
                                            Email: user.Email,
                                            UserID: userId
                                        }];
                                    }
                                    service.GetCustomers(userId).then(function(customers) {
                                        res.Customers = res.Customers.concat(customers);
                                        service.GetCustomersForUsers(relatedUsers, userId).then(function(customers) {
                                            res.Customers = res.Customers.concat(customers);
                                            if (relatedUsers.length > 0) {
                                                service.GetCustomersForUsers(relatedUsers, -1).then(function(customers) {
                                                    var pWait = [];
                                                    customers.forEach(function(customer) {
                                                        pWait.push((function() {
                                                            var deferred = Q.defer();
                                                            Models.MasterQuote.all().filter('LCustomerID', '=', customer.id)
                                                                .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(mqs) {
                                                                    mqs.forEach(function(mq) {
                                                                        mq.Cusomer = customer;
                                                                    });
                                                                    res.CustomerMasterQuotes = res.CustomerMasterQuotes.concat(mqs);
                                                                    Models.DoorQuotes.all().filter('LCustomerID', '=', customer.id).list(function(dqs) {
                                                                        dqs.forEach(function(dq) {
                                                                            dq.Cusomer = customer;
                                                                        });
                                                                        res.CustomerDoorQuotes = res.CustomerDoorQuotes.concat(dqs);
                                                                        deferred.resolve();
                                                                    });
                                                                });
                                                            return deferred.promise;
                                                        })());
                                                    });
                                                    Q.allSettled(pWait).then(function() {
                                                        deferred.resolve(res);
                                                    });
                                                });
                                            } else {
                                                Models.Customers.all().filter('UserID', '=', userId)
                                                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(customers) {
                                                        var pWait = [];
                                                        customers.forEach(function(customer) {
                                                            pWait.push((function() {
                                                                var deferred = Q.defer();
                                                                Models.MasterQuote.all().filter('LCustomerID', '=', customer.id)
                                                                    .and(new persistence.PropertyFilter('Deleted', '=', false)).list(function(mqs) {
                                                                        res.CustomerMasterQuotes = res.CustomerMasterQuotes.concat(mqs);
                                                                        Models.DoorQuotes.all().filter('LCustomerID', '=', customer.id).list(function(dqs) {
                                                                            res.CustomerDoorQuotes = res.CustomerDoorQuotes.concat(dqs);
                                                                            deferred.resolve();
                                                                        });
                                                                    });
                                                                return deferred.promise;
                                                            })());
                                                        });
                                                        Q.allSettled(pWait).then(function() {
                                                            deferred.resolve(res);
                                                        });
                                                    });
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    } else {
                        deferred.resolve(res);
                    }
                });

            });

        } else {
            $http.post(Config.API.Endpoints.User.GetCustomers, { id: userId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;

    };

    service.SaveCustomer = function(customer) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                if (customer.id !== undefined && customer.id !== null && customer.id !== "") {
                    Models.Alter(Models.Customers, customer).then(function(customer) {
                        deferred.resolve(customer);
                    });
                } else {
                    Models.Create(Models.Customers, customer).then(function(customer) {
                        deferred.resolve(customer);
                    });
                }
            });
        } else {
            $http.post(Config.API.Endpoints.User.SaveCustomer, { customer: customer }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }


        return deferred.promise;
    };

    service.DeleteCustomer = function(customer) {
        var deferred = Q.defer();

        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Delete(Models.Customers, customer).then(function() {
                    deferred.resolve();
                });
            });
        } else {
            $http.post(Config.API.Endpoints.User.DeleteCustomer, { customerId: customer.CustomerID, userId: customer.UserID }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.GetCustomer = function(id, rId) {
        var deferred = Q.defer();
        if (Config.API.getMode() === Config.API.Modes.OFFLINE) {
            Database.ready().then(function() {
                Models.Customers.findBy('id', id, function(customer) {
                    deferred.resolve(customer);
                });
            });
        } else {
            $http.post(Config.API.Endpoints.User.GetCustomer, { customerId: rId }).then(function(data) {
                deferred.resolve(data.data);
            }, function() {
                deferred.reject();
            });
        }
        return deferred.promise;
    };

    service.Impersonate = function(userId) {
        var deferred = Q.defer();
        $http.post(Config.API.Endpoints.User.Impersonate, { userId: userId }).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    service.GetCompleteUserList = function() {
        var deferred = Q.defer();
        $http.post(Config.API.Endpoints.User.GetCompleteUserList, {}).then(function(data) {
            deferred.resolve(data.data);
        }, function() {
            deferred.reject();
        });
        return deferred.promise;
    };

    return service;

});
