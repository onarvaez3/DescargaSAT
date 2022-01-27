chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    if(request)
    {
        if(request.data == "full")
        {
            var result = { 
                "records": new Array(),
                "pdfCount": 0,
                "xmlCount": 0,
                "cancelCount": 0
            };
            let recordCounter = 0;
            let nameCounter = 0;

            var tableRows = document.getElementById("ctl00_MainContent_tblResult").firstElementChild.children;
            for (const tr of tableRows)
            {
                let newRecord = {
                    "id": recordCounter
                }
                if(tr.firstElementChild && tr.firstElementChild.tagName == "TD") {
                    if(tr.firstElementChild.firstElementChild && tr.firstElementChild.firstElementChild.tagName == "DIV")
                    {
                        if(tr.firstElementChild.firstElementChild.firstElementChild && tr.firstElementChild.firstElementChild.firstElementChild.tagName == "TABLE")
                        {
                            let innerTable = tr.firstElementChild.firstElementChild.firstElementChild;
                            if(innerTable.firstElementChild && innerTable.firstElementChild.tagName == "TBODY")
                            {
                                for(const td of innerTable.firstElementChild.firstElementChild.children)
                                {
                                    if(td.hasChildNodes)
                                    {
                                        let child = td.firstElementChild;
                                        if(child && child.hasAttribute("id"))
                                        {
                                            switch (child.getAttribute("id")) {
                                                case "BtnDescarga":
                                                    var relURL = child.getAttribute('onclick');
                                                    if(relURL.length > 0) 
                                                    {
                                                        var downloadParams = relURL.match("\'([^']+)\'")[1];
                                                        newRecord["xmlDownloadLink"] = "https://portalcfdi.facturaelectronica.sat.gob.mx/" + downloadParams;
                                                        result.xmlCount++;
                                                    }
                                                    else
                                                    {
                                                        console.error('Element is missing onclick event');
                                                    }
                                                    break;
                                                case "BtnRI":
                                                    var relURL = child.getAttribute('onclick');
                                                    if(relURL.length > 0) 
                                                    {
                                                        var downloadParams = relURL.match("\'([^']+)\'")[1];
                                                        newRecord["pdfDownloadLink"] = "https://portalcfdi.facturaelectronica.sat.gob.mx/RepresentacionImpresa.aspx?Datos=" + downloadParams;
                                                        result.pdfCount++;
                                                    }
                                                    else
                                                    {
                                                        console.error('Element is missing onclick event');
                                                    }
                                                    break;
                                                case "BtnRecuperaAcuseFinal":
                                                    var relURL = child.getAttribute('onclick');
                                                    if(relURL.length > 0) 
                                                    {
                                                        var downloadParams = relURL.match("\'([^']+)\'")[1];
                                                        newRecord["cancelDownloadLink"] = "https://portalcfdi.facturaelectronica.sat.gob.mx/" + downloadParams;
                                                        result.cancelCount++;
                                                    }
                                                    else
                                                    {
                                                        console.error('Element is missing onclick event');
                                                    }
                                                    break;
                                            
                                                default:
                                                    break;
                                            }
                                        }
                                    }
                                }
                                result.records.push(newRecord);
                                recordCounter++;
                            }
                        }
                    }
                }
            };

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

                        result.records[nameCounter]["filename"] = rfc_emisor.match('[a-zA-Z]+')[0] + "-" + uuid.substring(0,8);
                        nameCounter++;
                    }
                }
            }

            if(recordCounter == nameCounter)
            {
                sendResponse(result);
            } else {
                sendResponse("Counters mismatch");
            }
        }
        else if(request.data = "count")
        {
            sendResponse(document.getElementsByName('BtnRI').length);
        }
    }
});
