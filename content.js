chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request)
    {
        if(request.data == "full")
        {
            let pageType = 0; //0=recibidas, 1=emitidas
            var result = { 
                "records": new Array(),
                "pdfCount": 0,
                "xmlCount": 0,
                "cancelCount": 0,
                "allCount": 0,
                "zipFileName": ""
            };
            let recordCounter = 0;
            let nameCounter = 0;
            let nominaCounter = 0;

            if(document.getElementById('cuerpo') && document.getElementById('cuerpo').hasChildNodes())
            {
                if(document.getElementById('cuerpo').firstElementChild.textContent.includes('Emitidas'))
                {
                    pageType = 1;
                }
            }
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
            var j = 0;
            var h = 0;
            for(var i = 0; i<tds.length;i++)
            {
                if(tds[i].hasAttribute("style") && tds[i].attributes["style"].value == "WORD-BREAK:BREAK-ALL;") 
                {
                    if(tds[i].textContent.match("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}"))
                    {
                        var uuid = tds[i].textContent;
                        if(pageType)
                        {
                            j = i+1;
                            i+=3;
                        }
                        else {
                            i++;
                            j = i+2;
                            h = i + 8;
                        }
                        var rfc_emisor = tds[i].textContent.match('[a-zA-Z]+')[0];
                        result.records[nameCounter]["filename"] = rfc_emisor + "-" + uuid.substring(0,8);
                        result.records[nameCounter]["efecto"] = tds[h].textContent;
                        if(result.records[nameCounter]["efecto"] == "Nómina")
                        {
                            nominaCounter++;
                        }

                        if(result.zipFileName.length == 0)
                        {
                            var rfc_receptor = tds[j].textContent.match('[a-zA-Z]+')[0];
                            result.zipFileName = rfc_receptor + (pageType == 1 ? "_emitidas_" : "_recibidas_");
                        }
                        
                        nameCounter++;
                    }
                }
            }

            if(recordCounter == nameCounter)
            {
                result.allCount = result.pdfCount + result.cancelCount + result.xmlCount;
                result.nominaCount = nominaCounter;
                sendResponse(result);
            } else {
                sendResponse(null);
            }
        }
    }
});