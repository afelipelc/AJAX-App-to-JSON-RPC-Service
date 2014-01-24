// codigo de ejemplo escrito por A Felipe.
// como ejemplo para la asignatura: Desarrollo de Aplicaciones III
// en la Universidad Tecnológica de Izúcar de Matamoros, Puebla.

// afelipelc@gmaill.com

//variables globales y funciones

var url_servicio = 'http://localhost/deptosws/ws.php';
var tempdelete="";
var errorStart=false;
var BSON;// = bson().BSON;
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
        enctype: "multipart/form-data",
        dataType:"JSON",
        success:  funcion,
        error: function (err)  {
            alert ("Error en la llamada al servidor. \n\nCompruebe que tiene acceso a "+ url_servicio); //si el metodo responde con un error
            errorStart=true;
        }
    });
}

//variable and function for send files
var imagen;
function prepareUpload(event)
{
  imagen = event.target.files;
}

function uploadFile(idDepto){
    //alert("subiendo foto" + idDepto)

    var dataForm = new FormData();
    var foto = imagen[0];

    dataForm.append("idDepto",idDepto);
    //attach file
    //$.each(imagen, function(key, value){
        dataForm.append('foto',foto);
    //});

    //send ajax call
    // $.ajax({
    //     url: 'http://localhost/deptosws/imagenes.php', 
    //     data: dataForm, 
    //     type:"GET", //contentType : "application/json; charset=utf-8",

    //     success:  function(data){
    //         //alert(data);
    //     },
    //     error: function (err)  {
    //         alert ("Error al cargar la imagen. \n\nCompruebe que tiene acceso a "+ url_servicio); //si el metodo responde con un error
    //     }
    // });
            $.ajax({
                        url: 'http://localhost/deptosws/imagenes.php',  //server script to process data
                        type: 'POST',
                        xhr: function() {  // custom xhr
                            myXhr = $.ajaxSettings.xhr();
                            if(myXhr.upload){ // if upload property exists
                                myXhr.upload.addEventListener('progress', function(){
                                    //...
                                }, false); // progressbar
                            }
                            return myXhr;
                        },
                        //Ajax events
                        success: completeHandler = function(data) {
                            /*
                            * workaround for crome browser // delete the fakepath
                            */
                            alert("Respuesta: " + data);
                            // if(navigator.userAgent.indexOf('Chrome')) {
                            //     var catchFile = $(":file").val().replace(/C:\\fakepath\\/i, '');
                            // }
                            // else {
                            //     var catchFile = $(":file").val();
                            // }
                            // var writeFile = $(":file");

                            // writeFile.html(writer(catchFile));

                            // $("*setIdOfImageInHiddenInput*").val(data.logo_id);

                        },
                        error: errorHandler = function() {
                            alert("Något gick fel");
                        },
                        // Form data
                        data: dataForm,
                        //Options to tell JQuery not to process data or worry about content-type
                        cache: false,
                        contentType: false,
                        processData: false
                    }, 'text');
}

var errorInWS = function(data){
    if(data.error){
        alert("Error interno en el servidor. \n\n Code: " + data.error.code +"\nMessage: " + data.error.message);
        return true;
    }
};

function itemLayout(item){
    var depto = '<div id="item'+item.id+'" class="itemClass deptoItem"><div id="itemContent"><img src="..."/><h4>'+item.nombre+'</h4><p>'+item.responsable+'</p><label>'+item.cargoResp+'</label><p>Tel. '+item.telefono+'</p><p>Email: '+item.email+'</p><p>'+item.informacion+'</p></div><div class="itemOptions"><a href="#" id="editItem">Editar</a><a href="#" id="removeItem">Eliminar</a></div></div>';
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

       errorInWS();
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
            $("#departamentoViewContent #cargoResp").html(item.cargoResp);
            $("#departamentoViewContent #telefono").html(item.telefono);
            $("#departamentoViewContent #email").html(item.email);
            $("#departamentoViewContent #email").attr("href","mailto:"+item.email);
            $("#departamentoViewContent #información").html(item.informacion);
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
            uploadFile(data.result.id);
            //insertar antes del boton +
            //$("#mainContent #newItem").before(itemLayout(data.result));
            alert("Se ha registrado el departamento");
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
        $("#telefono").val(item.telefono);
        $("#email").val(item.email);
        $("#otraInfo").val(item.informacion);
        $('#cargoResp option:selected', 'select').removeAttr('selected');//.next('option').attr('selected', 'selected');
        $("#cargoResp").val(item.cargoResp);
        $("#cargoResp option:text=" + item.cargoResp +"").attr("selected", "selected"); 
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
    var nuevo = '<div id="newItem" class="itemClass"><a href="#" id="addItem">Agregar Departamento</a></div>';
    $("#mainContent").append(nuevo);
}


//Funcion para guardar el Departamento (Nuevo o Edicion)
function guardarDepartamento(event)
{
    //preparar archivo imagen a enviar
// var datosImg = new FormData();
//     if(imagen){
//         $.each(imagen, function(key, value){
//             datosImg.append(key,value);
//         });
//     }
    //var datosImg = serialize(imagen);
    //alert(datosImg);
    //var datosImg = BSON.serialize(imagen[0], false, true, false);
    //alert(BSON.deserialize(datosImg));
    if($("#departamentoForm #actionForm").val()=="new"){
        jsonRpcFunction("RegistrarDepartamento",[$("#nombre").val(),$("#resposable").val(),$("#cargoResp").val(), $("#email").val(), $("#telefono").val(), $("#otraInfo").val()],departamentoSavedNewFunction);
    }
    else if ($("#departamentoForm #actionForm").val()=="edit") {
        jsonRpcFunction("ActualizarDepartamento",[$("#idDepartamento").val(),$("#nombre").val(),$("#resposable").val(),$("#cargoResp").val(), $("#email").val(), $("#telefono").val(), $("#otraInfo").val()],departamentoSavedChangesFunction);
        uploadFile($("#idDepartamento").val());
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
    });
}

function departamentoEdit(idDepto){
    $("#mainContent").load("html/DepartamentoForm.html", function(){
        jsonRpcFunction("DatosDepartamento",[idDepto],departamentoEditViewFunction);
    });   
}


function cargarItems(){
    $("#mainContent").html("");
    nuevoItemLayout();
    jsonRpcFunction("Departamentos", [], departamentosFunction);
    
}

function buscarDepartamentos(q){
    $("#mainContent").html("");
    $("#mainContent").append("<div>Resultados de la búsqueda para: <strong>"+q+"</strong></div>")
    nuevoItemLayout();
    jsonRpcFunction("Buscar",[q],departamentosFunction);
}



//DOCUMENT READY
$( document ).ready(function() {
    //initialize BSON
    BSON = bson().BSON;

    //departamentoEdit(3);
    cargarItems();


    //EVENTOS
    $("#mainContent").on("click","#addItem",function(){
        //departamentoEdit(3);
        nuevoDepartamento();
    });

    $("#mainContent").on("change","input[type=file]",prepareUpload);

    $("#mainContent").on("submit","#departamentoForm", function(event){
        event.stopPropagation();
        event.preventDefault();
        guardarDepartamento(event);
    });

    $("#mainContent").on("click","#cancelarBtn",function(){
        cargarItems();
    });

    $("#mainContent").on("click","#editItem",function(event){
        //get parent and replace "item" text to "" and get element ID
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
});

// afelipelc@gmaill.com