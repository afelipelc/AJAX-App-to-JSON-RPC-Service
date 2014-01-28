// codigo de ejemplo escrito por A Felipe.
// como ejemplo para la asignatura: Desarrollo de Aplicaciones III
// en la Universidad Tecnológica de Izúcar de Matamoros, Puebla.

// afelipelc@gmail.com
//variables globales y funciones

var url_servicio = 'http://localhost/deptosws/ws.php';
var tempdelete="";
var errorStart=false;
//Funcion Global para la llamada a los metodos remotos
function jsonRpcFunction(metodo, parametros, funcion)
{
    $.ajax({
        url: url_servicio, 
        data: JSON.stringify ({
            jsonrpc:'2.0',
            method: metodo,
            params: parametros,
            id:"jsonrpc"
        }), 
        type:"POST", //contentType : "application/json; charset=utf-8",
        dataType:"JSON",
        success:  funcion,
        error: function (jqXHR, textStatus, errorThrown)  {
            console.log(errorThrown); console.log(textStatus); 
            alert ("Error en la llamada al servidor. \n\nCompruebe que tiene acceso a "+ url_servicio); //si el metodo responde con un error
            errorStart=true;
        }
    });
}


var errorInWS = function(data){
    if(data.error){
        alert("Error interno en el servidor. \n\n Code: " + data.error.code +"\nMessage: " + data.error.message);
        return true;
    }
};

function itemLayout(item){
    var depto = '<div id="item'+item.id+'" class="itemClass deptoItem"><div id="itemContent"><img src="images/depto/'+item.fotoResp+'"/><h4>'+item.nombre+'</h4><p>'+item.responsable+'</p><label>'+item.cargoResp+'</label><p>Tel. '+item.telefono+'</p><p>Email: '+item.email+'</p><p>'+item.informacion.substr(0,33)+'...</p></div><div class="itemOptions ocultarOptions"><a href="#" id="editItem"></a><a href="#" id="removeItem"></a></div></div>';
    return depto;
}

//funcion para procesar los datos de los departamentos recibidos
var departamentosFunction = function(data){
    if(!errorInWS(data)){
       $.each(data.result, function(i, item)
        {
            //call item Layout 
            //insertar antes del boton +
            $("#mainContent #newItem").before(itemLayout(item));
        });
    }
};

//funcion para visualizar la vista detalles de un departamento
var departamentoViewFunction = function(data){
    if(!errorInWS(data)){
        var item = data.result;
        //editar el formato de vista HTML
        $("#mainContent").load("html/departamentoView.html",function(){
            $("#departamentoViewContent .itemcontainer").attr("id","item"+item.id);
            $("#departamentoViewContent #nombre").html(item.nombre);
            $("#departamentoViewContent #responsable").html(item.responsable);
            $("#departamentoViewContent #contenedorImagenView img").attr("src","images/depto/"+item.fotoResp);
            $("#departamentoViewContent #cargoResp").html(item.cargoResp);
            $("#departamentoViewContent #telefono").html(item.telefono);
            $("#departamentoViewContent #email").html(item.email);
            $("#departamentoViewContent #email").attr("href","mailto:"+item.email);
            $("#departamentoViewContent #informacion").html(item.informacion);
        })
    }
};

//funcion parar procesar cambios guardados en un Deparamento
var departamentoSavedChangesFunction = function(data){
    if(!errorInWS(data)){
        if(data.result==true)
            alert("El departamento ha sigo guardado");
        else
            alert("No se guardó el departamento. \nEsto puede ocurrir si no realizó ningún cambio.");
    }
}

//funcion parar procesar un Deparamento registrado
var departamentoSavedNewFunction = function(data){
    if(!errorInWS(data)){
        if(data.result!=null)
        {
            alert("Se ha registrado el departamento");
            //recargar formulario a edicion
            departamentoEdit(data.result.id);
        }
        else
            alert("El departamento no se registro");
    }
}

//funcion para ver un departamento en modo de edicion
var departamentoEditViewFunction = function(data){
    if(!errorInWS(data)){
        if(data.result == null){
            alert("No se obtuvieron datos del departamento a editar");
            return;
        }

        var item = data.result;
        //poner datos en formulario
        $("#idDepartamento").val(item.id);
        $("#actionForm").val("edit");
        $("#nombre").val(item.nombre);
        $("#resposable").val(item.responsable);
        $("#fotoDepto").attr("src","images/depto/"+item.fotoResp);
        $("#telefono").val(item.telefono);
        $("#email").val(item.email);
        $("#otraInfo").val(item.informacion);
        $('#cargoResp option:selected', 'select').removeAttr('selected');//.next('option').attr('selected', 'selected');
        $("#cargoResp").val(item.cargoResp);
        //$("#cargoResp option:text=" + item.cargoResp +"").attr("selected", "selected"); 
        
    }
}

var departamentoDeleteFunction = function(data){
    if(!errorInWS(data)){
        if(data.result){
            alert("El departamento ha sido eliminado." + tempdelete);
            $("#" + tempdelete).remove();
            tempdelete="";
        }else{
            alert("No se eliminó el departamento.");
        }
    }
}

//funcion para insertar el boton Agregar Depto
function nuevoItemLayout(){
    var nuevo = '<div id="newItem" class="itemClass"><a href="#" id="addItem"></a></div>';
    $("#mainContent").append(nuevo);
}


//Funcion para guardar el Departamento (Nuevo o Edicion)
function guardarDepartamento(event)
{
    if($("#departamentoForm #actionForm").val()=="new"){
        jsonRpcFunction("RegistrarDepartamento",[$("#nombre").val(),$("#resposable").val(),$("#cargoResp").val(), $("#email").val(), $("#telefono").val(), $("#otraInfo").val()],departamentoSavedNewFunction);
        return;
    }
    else if ($("#departamentoForm #actionForm").val()=="edit") {
        jsonRpcFunction("ActualizarDepartamento",[$("#idDepartamento").val(),$("#nombre").val(),$("#resposable").val(),$("#cargoResp").val(), $("#email").val(), $("#telefono").val(), $("#otraInfo").val()],departamentoSavedChangesFunction);
        //uploadFile($("#idDepartamento").val());
    }else
    {
        alert("Accion desconocida");
        return;
    }
    //reload items
    cargarItems();
}

//Funcion para cargar el form y cargar datos del WS
function nuevoDepartamento(){
    $("#mainContent").load("html/DepartamentoForm.html", function(){
        $("#idDepartamento").val(0);
        $("#actionForm").val("new");
        $("#nombre").focus();

        //quitar la carga de imagen al ser nuevo registro
        $("#mainContent footer").remove();
        $("#departamentoForm #fotoContainer").remove();

    });
}

function departamentoEdit(idDepto){
    $("#mainContent").load("html/DepartamentoForm.html", function(){
        var urlupload = '../deptosws/imagenes.php?idDepartamento='+idDepto;
        $("#departamentoForm").attr("action",urlupload);
        jsonRpcFunction("DatosDepartamento",[idDepto],departamentoEditViewFunction);

        //cargamos el script que controlara la carga
        $("#mainContent #extraContent").load("html/uploadjs.html");
    });   
}


function cargarItems(){
    $("#mainContent").html("");
    nuevoItemLayout();
    jsonRpcFunction("Departamentos", [], departamentosFunction);
}

function buscarDepartamentos(q){
    $("#mainContent").html("");
    $("#mainContent").append("<a href=\"\" id=\"cancelarBtn\">Regresar</a><div>Resultados de la búsqueda para: <strong>"+q+"</strong></div>")
    nuevoItemLayout();
    jsonRpcFunction("Buscar",[q],departamentosFunction);
}


//DOCUMENT READY
$( document ).ready(function() {
    cargarItems();

    //EVENTOS
    $("#mainContent").on("click","#addItem",function(){ nuevoDepartamento(); });

    $("#mainContent").on("submit","#departamentoForm", function(event){
        event.stopPropagation();
        event.preventDefault();
        guardarDepartamento(event);
    });

    $("#mainContent").on("click","#cancelarBtn",function(){ cargarItems(); });

    $("#mainContent").on("click","#editItem",function(event){
        //get parent and replace "item" string to "" and get element ID
        departamentoEdit($(this).parent().parent().attr("id").replace("item",""));
    });

    $("#mainContent").on("click","#removeItem",function(event){
        //get parent and replace "item" text to "" and get element ID
        var result = confirm("Está seguro de eliminar el departamento: " + $(this).parent().parent().children().find("h4").html());
        if(result){
            tempdelete= $(this).parent().parent().attr("id");
            jsonRpcFunction("EliminarDepartamento",[$(this).parent().parent().attr("id").replace("item",""), true], departamentoDeleteFunction);
        }
    });

    $("#searchForm").submit(function(event){
        event.preventDefault();
        buscarDepartamentos($("#buscar").val());
    });

    $("#mainContent").on("click","#itemContent",function(){
        jsonRpcFunction("DatosDepartamento",[$(this).parent().attr("id").replace("item","")],departamentoViewFunction);
    });

    //show/hide options
    $("#mainContent").on("mouseenter",".deptoItem",function(){
        $($(this).find(".itemOptions")).removeClass("ocultarOptions");
        $($(this).find(".itemOptions")).addClass("mostrarOptions");
        //console.log($($(this).find(".itemOptions")).attr("class"));
    });

    $("#mainContent").on("mouseleave",".deptoItem",function(){
        $($(this).find(".itemOptions")).removeClass("mostrarOptions");
        $($(this).find(".itemOptions")).addClass("ocultarOptions");
        //console.log($($(this).find(".itemOptions")).attr("class"));
    });
});

// por afelipelc@gmaill.com
// enero 2014