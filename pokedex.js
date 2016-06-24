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
    widgets: ['filter', 'stickyHeaders'],
    selectorHeaders: 'thead th, thead td',
    widgetOptions: {
        stickyHeaders : 'sticky',
        stickyHeaders_offset : 0,
        stickyHeaders_cloneId : '-sticky',
        stickyHeaders_addResizeEvent : true,
        stickyHeaders_includeCaption : true,
        stickyHeaders_zIndex : 2,
        stickyHeaders_attachTo : null,
        stickyHeaders_xScroll : null,
        stickyHeaders_yScroll : null,
        stickyHeaders_filteredToTop: true,

        filter_childRows : false,
        filter_childByColumn : false,
        filter_childWithSibs : true,
        filter_columnFilters : true,
        filter_columnAnyMatch: true,
        filter_cellFilter : '',
        filter_cssFilter : '', // or []
        filter_defaultFilter : {},
        filter_excludeFilter : {},
        filter_external : '',
        filter_filteredRow : 'filtered',
        filter_formatter : null,
        filter_functions : null,
        filter_hideEmpty : true,
        filter_hideFilters : true,
        filter_ignoreCase : true,
        filter_liveSearch : true,
        filter_matchType : { 'input': 'exact', 'select': 'exact' },
        filter_onlyAvail : 'filter-onlyAvail',
        filter_placeholder : { search : '', select : '' },
        filter_reset : 'button.reset',
        filter_resetOnEsc : true,
        filter_saveFilters : true,
        filter_searchDelay : 300,
        filter_searchFiltered: true,
        filter_selectSource  : null,
        filter_serversideFiltering : false,
        filter_startsWith : false,
        filter_useParsedData : false,
        filter_defaultAttrib : 'data-value',
        filter_selectSourceSeparator : '|'
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
        $('select#filter').val('default');
        $('#options').click(function(){$('#options_container').slideToggle(200)});
        $('select#filter').change(applyFilter);

    });
};

$(document).ready(function(){
    initialize();
});

