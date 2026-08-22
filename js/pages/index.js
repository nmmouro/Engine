import {
    createHeader
} from "../engine/header.js";


const headerContainer =
    document.querySelector(
        "#header"
    );


createHeader({

    container:
        headerContainer,

    titulo:
        "Painel Frota",

    logo:
        "img/logo.png"

});
