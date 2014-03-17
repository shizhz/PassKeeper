(function($) {
    'use strict';

    var defaultSettings = {
        compareBoxId: 'selectDiv',
        checkboxPrefix: 'compareCheckbox-',
        checkboxLabelPostfix: '-label',
        checkboxPricePostfix: '-price',
        selectedIdsTag: 'selectedIds',
        selectedIdsSep: ','
    };
    var SelectedComparingIds = [];

    $.fn.compare = function(options) {
        var settings = $.extend(true, defaultSettings, options);
        var Compare = {
            getAllCheckboxes: function() {
                var checkboxSelector = 'input:checkbox[id^=' + settings.checkboxPrefix + ']';
                return $(checkboxSelector);
            },

            getAllCheckedboxes: function() {
                return SelectedComparingIds.map(function(offeringId) {
                    return settings.checkboxPrefix + offeringId;
                });
            },

            flushCheckboxStatus: function() {
                var checkedBoxes = this.getAllCheckedboxes();

                this.getAllCheckboxes().each(function() {
                    var checkboxId = $(this).attr('id');
                    if (checkedBoxes.indexOf(checkboxId) > -1) {
                        $(this).attr('checked', 'checked');
                    }
                });
            },

            flushComparingDivBox: function() {
                var comparingBox = $('#' + settings.compareBoxId);
                var itemContainer = $('#items', comparingBox).empty();

                SelectedComparingIds.forEach(function(offeringId) {
                    var name = $('#' + settings.checkboxPrefix + offeringId + settings.checkboxLabelPostfix).val();
                    var price = $('#' + settings.checkboxPrefix + offeringId + settings.checkboxPricePostfix).val();
                    var itemHTML = "<div class='item' id='item_" + offeringId + "'>" + "<div class='content'>" + "<div class='productname'>" + name + "</div>" + "<div class='productprice'>" + price + "</div>" + "</div>" + "<a href='javascript:;' class='removebtn'></a>" + "<input type='hidden'  value=\'" + offeringId + "\'/>" + "</div>"
                    $(itemHTML).appendTo(itemContainer);
                });

                comparingBox.toggle(SelectedComparingIds.length > 0);
            },

            registerCheckboxClick: function() {
                var checkboxes = this.getAllCheckboxes();
                var that = this;
                checkboxes.each(function() {
                    $(this).on('click', function(event) {
                        console.log('Clicked: ' + $(this).attr('id'))
                        // TODO: PROCESS FOR CLICK
                        SelectedComparingIds.push($(this).val());
                        SelectedComparingIds = SelectedComparingIds.filter(function(offeringId) {
                            return $('#' + settings.checkboxPrefix + offeringId).is(':checked') && SelectedComparingIds.indexOf(offeringId) == -1;
                        });
                    });
                });
                this.flushComparingDivBox();
            },

            initSelectedComparingIds: function() {
                // init selectedIds
                var ids = $('#' + settings.selectedIdsTag).val();
                ids = ids ? ids : '';
                SelectedComparingIds = ids.split(settings.selectedIdsSep).map(function(item) {
                    return $.trim(item);
                }).filter(function(item) {
                    return item.length > 0;
                });
            },

            init: function() {
                this.initSelectedComparingIds();
                this.flushCheckboxStatus();
                this.flushComparingDivBox();
                this.registerCheckboxClick();
            },
        };

        Compare.init();
        return this;
    };
})(jQuery);
