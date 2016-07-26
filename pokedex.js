var _pokemon = {};

var rowClick = function(){

    var $row = $(this).closest('tr');

    if($row.hasClass('got-it')){
        $row.removeClass('got-it');
        removeFromLocalStorage($row.find('.id').html());
    } else {
        $row.addClass('got-it');
        saveToLocalStorage($row.find('.id').html());
    }
    if(shouldFilterHide($row.hasClass('got-it'))){
        $row.fadeOut(400);
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
};

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
        var $row = $('td.id:contains('+idx+')').parents('tr');
        $row.addClass('got-it');
        $row.find('td.collected input').attr('checked', 'checked');
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

var parsePokemon = function(pkmn){
    $.each(pkmn, function(idx, val){
        val['intID'] = idx+1;
    });
    return pkmn;
};

var loadPokemon = function(callback){
    $.ajax({
        url: "pokedex.json",
        dataType: 'json',
        success: function(pokemon){
            _pokemon = parsePokemon(pokemon);
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

var getLocation = function(e){
    console.log($(this));
    var id = $(this).closest('tr').data('id');
    var idxId = parseInt(id)-1;
    var gen = $(this).data('gen');
    if(_pokemon[idxId]["location"][gen] != ''){
        $(this).siblings('.location').html(_pokemon[idxId]["location"][gen]);
    } else {
        $(this).siblings('.location').html('Locations for this gen either don\'t exist, or is not implemented in our system');
    }
    e.preventDefault();
};

var initialize = function(){
    loadPokemon(function(){
        setupCollected();
        loadStatus();
        var $dexTable = $('table#dex_table');
        $dexTable.tablesorter(sorterConfig);
        $('button#export_json').click(exportJSON);
        $('button#import_json').click(importJSON);
        $('select#filter').val('default');
        $('#options').click(function(){$('#options_container').slideToggle(200)});
        $('select#filter').on('change', applyFilter);
        $(document).on("click", '.loc-gen', getLocation);
        $(document).on("change", '.check', rowClick);
    });
};

$(document).ready(function(){
    initialize();
});

