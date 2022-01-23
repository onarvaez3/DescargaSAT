chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    if(request)
    {
        if(request.data == "full")
        {
            var downloadLinks = { pdfDownloadLinks: new Array(), xmlDownloadLinks: new Array(), fileNames: new Array() };

            var riElements = document.getElementsByName('BtnRI');
            for (var i = 0; i < riElements.length; i++) 
            {
                var relURL = riElements[i].getAttribute('onclick');
                if(relURL.length > 0) 
                {
                    var downloadParams = relURL.match("\'([^']+)\'")[1];
                    downloadLinks.pdfDownloadLinks.push("https://portalcfdi.facturaelectronica.sat.gob.mx/RepresentacionImpresa.aspx?Datos=" + downloadParams);
                }
                else
                {
                    console.error('Element is missing onclick event');
                }
            }

            var xmlElements = document.getElementsByName('BtnDescarga');
            for (var i = 0; i < xmlElements.length; i++) 
            {
                var relURL = xmlElements[i].getAttribute('onclick');
                if(relURL.length > 0) 
                {
                    var downloadParams = relURL.match("\'([^']+)\'")[1];
                    downloadLinks.xmlDownloadLinks.push("https://portalcfdi.facturaelectronica.sat.gob.mx/" + downloadParams);
                }
                else
                {
                    console.error('Element is missing onclick event');
                }
            }

            var tds = document.getElementById("ContenedorDinamico").getElementsByTagName('td');
            for(var i = 0; i<tds.length;i++)
            {
                if(tds[i].hasAttribute("style") && tds[i].attributes["style"].value == "WORD-BREAK:BREAK-ALL;") 
                {
                    if(tds[i].textContent.match("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}"))
                    {
                        var uuid = tds[i].textContent;
                        i++;
                        var rfc_emisor = tds[i].textContent;

                        downloadLinks.fileNames.push(rfc_emisor.substring(0,3) + "-" + uuid.substring(0,8));
                    }
                }
            }

            sendResponse(downloadLinks);
        }
        else if(request.data = "count")
        {
            sendResponse(document.getElementsByName('BtnRI').length);
        }
    }
});