var _pokemon = {};

var rowClick = function(){
    if($(this).hasClass('got-it')){
        $(this).removeClass('got-it');
        removeFromLocalStorage($(this).find('.id').html());
    } else {
        $(this).addClass('got-it');
        saveToLocalStorage($(this).find('.id').html());
    }
    if(shouldFilterHide($(this).hasClass('got-it'))){
        $(this).fadeOut(400);
    }
    loadStatus();
};

var sorterConfig = {
    widgets: ['stickyHeaders', 'filter' ],
    selectorHeaders: 'thead th, thead td',
    widgetOptions: {

        // extra class name added to the sticky header row
        stickyHeaders : 'sticky',
        // number or jquery selector targeting the position:fixed element
        stickyHeaders_offset : 0,
        // added to table ID, if it exists
        stickyHeaders_cloneId : '-sticky',
        // trigger "resize" event on headers
        stickyHeaders_addResizeEvent : true,
        // if false and a caption exist, it won't be included in the sticky header
        stickyHeaders_includeCaption : true,
        // The zIndex of the stickyHeaders, allows the user to adjust this to their needs
        stickyHeaders_zIndex : 2,
        // jQuery selector or object to attach sticky header to
        stickyHeaders_attachTo : null,
        // jQuery selector or object to monitor horizontal scroll position (defaults: xScroll > attachTo > window)
        stickyHeaders_xScroll : null,
        // jQuery selector or object to monitor vertical scroll position (defaults: yScroll > attachTo > window)
        stickyHeaders_yScroll : null,

        // scroll table top into view after filtering
        stickyHeaders_filteredToTop: true



        // *** REMOVED jQuery UI theme due to adding an accordion on this demo page ***
        // adding zebra striping, using content and default styles - the ui css removes the background from default
        // even and odd class names included for this demo to allow switching themes
        // , zebra   : ["ui-widget-content even", "ui-state-default odd"]
        // use uitheme widget to apply defauly jquery ui (jui) class names
        // see the uitheme demo for more details on how to change the class names
        // , uitheme : 'jui'
    }
}

var shouldFilterHide = function(gotIt){
    switch($('select#filter option:selected').val()){
        case 'caught':
            return !gotIt;
        case 'un-caught':
            return gotIt;
        default:
            return false;
    }
};

var saveToLocalStorage = function(id){
    var pokedex = {};
    if(localStorage.pokedex){
        pokedex = JSON.parse(localStorage.pokedex);
    }
    pokedex[id] = true;
    localStorage.pokedex = JSON.stringify(pokedex);
};

var removeFromLocalStorage = function(id){
    var pokedex = {};
    if(localStorage.pokedex){
        pokedex = JSON.parse(localStorage.pokedex);
    }
    delete pokedex[id];
    localStorage.pokedex = JSON.stringify(pokedex);
};

var setupCollected = function(){
    var pokedex = {};
    if(localStorage.pokedex){
        pokedex = JSON.parse(localStorage.pokedex);
    }
    $.each(pokedex, function(idx){
        $('td.id:contains('+idx+')').parents('tr').addClass('got-it');
    });
};

var exportJSON = function(){
    if(localStorage.pokedex){
        $('textarea#user_data').html(localStorage.pokedex).show();
    } else {
        alert('No save data');
    }
};

var importJSON = function(){
    var $data = $('textarea#user_data').val();
    console.log($data);
    localStorage.pokedex = $('textarea#user_data').val();
};

var applyFilter = function(){
    var $table = $('table#dex_table');
    var filter = $(this).find('option:selected').val();
    switch(filter){
        case 'caught':
            $table.find('tbody tr').hide();
            $table.find('tbody tr.got-it').show();
            break;
        case 'un-caught':
            $table.find('tbody tr').hide();
            $table.find('tbody tr:not(.got-it)').show();
            break;
        default:
            showAll();
    }
};

var showAll = function(){
    $('table#dex_table').find('tbody tr').show();
};

var loadStatus = function(){
    var tpl = $('#status_template').html();
    var $dexTable = $('#dex_table');
    var total = $dexTable.find('tbody tr').length;
    var caught = $dexTable.find('tbody tr.got-it').length;
    var diff = total - caught;
    $('#status').html(Mustache.render(tpl, {total: total, caught: caught, missing: diff}));
};

var loadPokemon = function(callback){
    $.ajax({
        url: "pokedex.json",
        dataType: 'json',
        success: function(pokemon){
            _pokemon = pokemon;
            var tpl = $('#pokedex_row_template').html();
            var html = Mustache.render(tpl, {pokemon: _pokemon});
            $('#dex_table').find('tbody').append(html);
        }
    }).done(function(){
        if($.isFunction(callback)){
            callback();
        }
    });
};

var initialize = function(){
    loadPokemon(function(){
        setupCollected();
        loadStatus();
        var $dexTable = $('table#dex_table');
        $dexTable.tablesorter(sorterConfig);
        $dexTable.find('tbody tr').click(rowClick);
        $('button#export_json').click(exportJSON);
        $('button#import_json').click(importJSON);
        $('#options').click(function(){$('#options_container').toggle()});
        $('select#filter').change(applyFilter);

    });
};

$(document).ready(function(){
    initialize();
});

