(function($) {
    'use strict';
    var DEBUG = true;
    var dbg = function function_name(msg) {
        if (!DEBUG) {
            return;
        }
        console.log(msg + '--: selectedIds: ' + selectedIds);
    };

    var defaultSettings = {
        compareBoxId: 'selectDiv',
        checkboxPrefix: 'compareCheckbox-',
        checkboxLabelPostfix: '-label',
        checkboxPricePostfix: '-price',
        selectedIdsTag: 'selectedIds',
        selectedIdsSep: ','

    };
    var selectedIds = [];

    $.fn.compare = function(options) {
        var settings = $.extend(true, defaultSettings, options);
        var Compare = {
            getAllCheckboxes: function() {
                var checkboxSelector = 'input:checkbox[id^=' + settings.checkboxPrefix + ']';
                return $(checkboxSelector);
            },

            getAllCheckedboxes: function() {
                return selectedIds.map(function(offeringId) {
                    return settings.checkboxPrefix + offeringId;
                });
            },

            flushCheckboxStatus: function() {
                var checkedBoxes = this.getAllCheckedboxes();

                this.getAllCheckboxes().each(function() {
                    var offeringId = $(this).attr('id');
                    if (checkedBoxes.indexOf(offeringId) > -1) {
                        $(this).attr('checked', 'checked');
                    }
                });
            },

            flushComparingDivBox: function() {
                selectedIds.forEach(function(offeringId) {
                    var name = $('#' + settings.checkboxPrefix + offeringId + settings.checkboxLabelPostfix).val();
                    var price = $('#' + settings.checkboxPrefix + offeringId + settings.checkboxPricePostfix).val();
                    var itemHTML = "<div class='item' id='item_" + offeringId + "'>" + "<div class='content'>" + "<div class='productname'>" + name + "</div>" + "<div class='productprice'>" + price + "</div>" + "</div>" + "<a href='javascript:;' class='removebtn'></a>" + "<input type='hidden'  value=\'" + offeringId + "\'/>" + "</div>"
                    $(itemHTML).appendTo($('#items'));
                });
            },

            init: function() {
                // init selectedIds
                var ids = $('#' + settings.selectedIdsTag).val();
                ids = ids ? ids : '';
                selectedIds = ids.split(settings.selectedIdsSep).map(function(item) {
                    return $.trim(item);
                }).filter(function(item) {
                    return item.length > 0;
                });
            },

        };

        Compare.init();
        Compare.flushCheckboxStatus();
        return this;
    };
})(jQuery);
