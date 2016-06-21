var excluded = ':nth-child(1), :nth-child(2)';

var rowClick = function(){
    if($(this).hasClass('got-it')){
        $(this).removeClass('got-it');
        removeFromLocalStorage($(this).find('.id').html());
    } else {
        $(this).addClass('got-it');
        saveToLocalStorage($(this).find('.id').html());
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
    $.each(pokedex, function(idx, val){
        $('td.id:contains('+idx+')').parents('tr').addClass('got-it');
    });
};

var exportJSON = function(){
    if(localStorage.pokedex){
        $('textarea#exportarea').html(localStorage.pokedex).show();
    } else {
        alert('No save data');
    }
};

var applyFilter = function(){
    var $table = $('table#dex_table');
    var filter = $(this).find('option:selected').val();
    console.log(filter);
    switch(filter){
        case 'caught':
            console.log($table.find('tr').not(excluded));
            $table.find('tr').not(excluded).hide();
            console.log($table.find('tr.got-it').not(excluded));
            $table.find('tr.got-it').not(excluded).show();
            break;
        case 'un-caught':
            console.log($table.find('tr').not(excluded));
            $table.find('tr').not(excluded).hide();
            console.log($table.find('tr').not(excluded).not('.gotIt'));
            $table.find('tr:not(.got-it)').not(excluded).show();
            break;
        default:
            $table.find('tr').not(excluded).show();
    }

};

var initialize = function(){
    $('table#dex_table').find('tr').not(excluded).click(rowClick);
    $('button#export_json').click(exportJSON);
    $('select#filter').change(applyFilter);
    setupCollected();
};

$(document).ready(function(){
    initialize();
});

