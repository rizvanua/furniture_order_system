mainApp.directive('showErrors', function() {
    return {
        restrict: 'A',
        require: '^form',
        link: function(scope, el, attrs, formCtrl) {

            // find the text box element, which has the 'name' attribute
            var inputEl = el[0].querySelector("[name]");
            // convert the native text box element to an angular element

            var inputNgEl = angular.element(inputEl);

            // get the name on the text box so we know the property to check
            // on the form controller
            var inputName = inputNgEl.attr('name');

            var errorMessage = "required";
            var invalidEmailMessage = "Please enter valid email";

            // only apply the has-error class after the user leaves the text box
            inputNgEl.bind('blur', function() {
                if ($(this).attr("type") == "email")
                    errorMessage = invalidEmailMessage;
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
                $(el).find("p.help-block").remove();
                if (formCtrl[inputName].$invalid) {
                    $(el).append("<p class='help-block'>" + errorMessage + "</p>");
                }
            });

            scope.$on('show-errors-check-validity', function(event, args) {
                if ($(attrs.$$element).closest("form").attr("name") == args.formName) {
                    if ($(attrs.$$element).find("input").attr("type") == "email")
                        errorMessage = invalidEmailMessage;
                    el.toggleClass('has-error', formCtrl[inputName].$invalid);
                    $(el).find("p.help-block").remove();
                    if (formCtrl[inputName].$invalid) {
                        $(el).append("<p class='help-block'>" + errorMessage + "</p>");
                    }
                }
            });

            scope.$on('show-errors-reset', function(event, args) {
                if ($(attrs.$$element).closest("form").attr("name") == args.formName) {
                    el.removeClass('has-error');
                }
            });

        }
    };
});
