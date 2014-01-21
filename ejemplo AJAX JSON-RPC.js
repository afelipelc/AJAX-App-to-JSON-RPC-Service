$(document).ready(function() {

    var url_servicio = 'http://localhost/deptosws/ws.php';
    
    $.ajax({
        url: url_servicio, 
        data: JSON.stringify ({
            jsonrpc:'2.0',
            method:'Departamentos', //Nombre del me'todo remoto
            params:[], //parametros que necesita el metodo remoto
            id:"jsonrpc"
        }), 
        type:"POST",
        dataType:"JSON", //Tipo de formato de retorno: Nuestro ws responde con JSON
        success:  function(data) { //funcion a ejecutar al recibir los datos de respuesta
        	alert(data.result); //el parametro RESULT es el contiene nuestros datos
        	//con un foreach podemos procesar objeto por objeto recibido(si recibimos un arreglo, sino, solo tomar result como valor unico de respuesta)
           $.each(data.result, function(i, item)
            {
            	alert("item x");// aqui ITEM representa nuestro objeto actual en el arreglo
            });

        },
        error: function (err)  {
            alert ("Error text"); //si el metodo responde con un error
        }
    });
});