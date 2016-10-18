 mainApp.directive('modifierSettings', function($http) {
     return {
         restrict: 'E',
         transclude: false,
         scope: {
             groupId: '=',
             products: '=',
             companyId: '='
         },
         link: function(scope, element, attrs) {
             scope.headerValues = ['A','B','C','D','E','F','G','H','I','J'];
             scope.distributorImgPath = "http://fbpublicstorage.blob.core.windows.net/uploadfiles/Distributors/";

             scope.SaveSettings = function(leaveModal, companyId) {
                 var isValid = true;
                 $.each(scope.settingModel, function(index, value) {
                     $.each(value.Lines, function(index2, value2) {
                         if (value2.OnFactor < 0 || value2.OnFactor > 1) {
                             toastr.error("OnFactor values must fall between 0 and 1. For list pricing use an on factor of 1 and markup of 0.");
                             isValid = false;
                             return;
                         }
                     });
                 });
                 if (isValid === true) {
                     scope.savingSettings = true;
                     $http.post(Config.API.Endpoints.CompanyAdmin.SaveSettings, { settingModel: scope.settingModel, setForAllCompanyId: companyId }).then(function(response) {
                         if (response.data.Message === null) {
                             //    scope.settingModel = response.data;
                             if (!leaveModal) {
                                 $('#modifierModal').modal('hide');
                             }
                         } else {
                             toastr.error(response.data.Message);
                         }
                         scope.savingSettings = false;
                     });
                 }
             };

             scope.savingSettings = false;
             scope.settingsProductId = 1;
             scope.settingsProductName = 'Doors';
             scope.changeSettingsProduct = function(prod) {
                 if (scope.savingSettings === false) {
                     scope.SaveSettings(true);
                     scope.settingsProductId = prod.ProductTypeID;
                     scope.settingsProductName = prod.ProductType;
                     scope.getSettings();
                 }
             };

             scope.getModifiers = function() {

                 $http.post(Config.API.Endpoints.CompanyAdmin.GetModifiers, { groupID: scope.groupId}).then(function(response) {
                     scope.settingModel = response.data;
                 });
             };

             scope.OpenSettingModal = function(settingModel) {
                 scope.getModifiers();
                 $("#modifierModal").modal("show");
             };

             $(document).on('show-modifiers', function(event, groupId) {
                 scope.groupId = groupId;
                 scope.OpenSettingModal();
             });

         },
         templateUrl: 'components/directives/company-admin/customer-modifier/customer-modifier.html'
     };
 });
