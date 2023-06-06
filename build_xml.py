'''
This program builds a JSON file that sits on the server so that when the map is built we can look
at the local xerver and not at the remote, which causes a CORS error. The script should be run 
periodically to update the JSON file with any changes that have been made to the maps, if maps
are being displayed strangly it is likly that their dimensions have changed and we need to run
this program

'''


import sys
import json
import requests
import xmltodict
import datetime

FEATURE_LAYERS = ["AD_BdryPoly","LCT_BdryPoly","DC_Point","TI_BdryPoly"]
URL_1 = "https://services1.arcgis.com/YpWVqIbOT80sKVHP/arcgis/rest/services/"
URL_2 = "/FeatureServer/0//query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=false&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token="

def fetch_prod_codes():
    arr = []
    for layer in FEATURE_LAYERS:
        url = URL_1 + layer + URL_2
        response = requests.get(url)
        if response.status_code == 200:
            json_data = response.json()
            keys_with_map_title = extract_prod_code(json_data, "ProdCode")
            arr = arr + keys_with_map_title
        else:
            print("Failed to fetch JSON from the provided URL.")
    return arr

def extract_prod_code(data,key):
    arr = []
    for feature in data.get("features"):
        #print(feature)
        value = feature.get("attributes").get(key)
        print (value)
        arr.append(value)
    return arr
        
def convert_xml_to_json(id,xml_strings):
    img_data = []
    
    for xml_string in xml_strings:
        data_dict = xmltodict.parse(xml_string,attr_prefix='')
        img_data.append(data_dict['IMAGE_PROPERTIES'])

    return{"id": id,"data": img_data}
def fetch_xml_and_create_json(id_list):
    #data = []
    json_file = {"date_created":str(datetime.datetime.now()),"maps": []}
    for id in id_list:
        array_of_strings = []
        for i in range(3):
            url = "https://images.natgeomaps.com/PROD_ZOOM/"+str(id)+"_"+str(i)+"/ImageProperties.xml"
            print(url)
            headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
            }
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                content_type = response.headers.get('Content-Type', '').lower()
                
                if 'application/xml' in content_type:
                    print(response.text)
                    array_of_strings.append(response.text)

            else:
                print(f"Failed to fetch URL: {url}")
        json_file["maps"].append(convert_xml_to_json(id,array_of_strings))
        #data.append(json_file)
    with open('data_output.json', 'w') as file:
        json.dump(json_file, file)

    print("Data saved to data_output.json")

# Example usage: python build_xml.py data.json
if __name__ == '__main__':
    #if len(sys.argv) != 2:
    #    print("Usage: python build_xml.py <url_file>")
    #else:
    #    url_file = sys.argv[1]
    #    fetch_urls_and_create_json(url_file)
    ids = fetch_prod_codes()
    fetch_xml_and_create_json(ids)