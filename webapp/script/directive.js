angular.module("appModule").
directive('rightClick', function ($compile) {
    document.oncontextmenu = function (e) {
        if (e.target.hasAttribute('right-click')) {
            e.preventDefault();
            e.stopPropagation();
            return false;//stop the default behavior of right click..
        }
    };

    var rightClickDom = undefined;
    return function (scope, el) {
        scope.dismissCopyToolTip = function () {
            rightClickDom.removeClass("ui-grid-cell-focus").next().remove(); //remove class & remove dom
        };

        el.bind('contextmenu', function () {
            rightClickDom && scope.dismissCopyToolTip(); //singleton element
            rightClickDom = angular.element(el);
            rightClickDom.addClass("ui-grid-cell-focus").after($compile('<ul id="rightClickToCopy" class=\"ui-grid-cell-contents\" style="position:absolute;height: inherit;"><button ngclipboard data-clipboard-text="' + el[0].innerText + '" ng-click="dismissCopyToolTip()" class="ss-btn ss-btn-warning">复制</button></ul>')(scope));
        });
    }
});
