<?php
function zoomsteps($pix)
{
    if ($pix <= 256)
    {
        return 0;
    }
    if ($pix <= 513)
    {
        return 1;
    }
    if ($pix <= 1027)
    {
        return 2;
    }
    if ($pix <= 2055)
    {
        return 3;
    }
    if ($pix <= 4111)
    {
        return 4;
    }
    if ($pix <= 8223)
    {
        return 5;
    }
    if ($pix <= 16447)
    {
        return 6;
    }
    if ($pix <= 32895)
    {
        return 7;
    }
    if ($pix <= 65791)
    {
        return 8;
    }
    else
    {
        exit;
    }
}
function pixinstep($pixmax, $zoomm, $zoomsteps)
{
    $pixcounter = $pixmax;
    for ($z = $zoomsteps;$z >= $zoomm + 1;$z--)
    {
        $pixcounter = floor($pixcounter / 2);
    }
    return $pixcounter;
}

$xml_url = htmlspecialchars($_GET["url"]);
// create curl resource
$ch = curl_init();

// set url
curl_setopt($ch, CURLOPT_URL, $xml_url);

//return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// $output contains the output string
$output = curl_exec($ch);

// close curl resource to free up system resources
curl_close($ch);


$page = explode ( 'WIDTH="' , $output )[1] ;
$xabs = explode ( '" ' , $page , 2 )[0] ;

$page = explode ( 'HEIGHT="' , $output )[1] ;
$yabs = explode ( '" ' , $page , 2 )[0] ;



$base_url = explode("/ImageProperties.xml", $xml_url) [0];
$zip = new ZipArchive;
$res = $zip->open('test.zip', ZipArchive::CREATE);

$tilegroup = 0;
$tilegroupcounter = 0;

if($xabs>$yabs) {$zoomsteps=zoomsteps($xabs);} else {$zoomsteps=zoomsteps($yabs);}

for ($zoom = 0;$zoom <= $zoomsteps;$zoom++)
{
    $xlevelpix = ceil(pixinstep($xabs, $zoom, $zoomsteps) / 256);
    $ylevelpix = ceil(pixinstep($yabs, $zoom, $zoomsteps) / 256);
echo "XlevelPix=$xlevelpix, ylevel=$ylevelpix, xabs=$xabs zoom=$zoom zoomsteps=$zoomsteps ceil=".pixinstep($xabs, $zoom, $zoomsteps)." ceil/=".ceil(pixinstep($xabs, $zoom, $zoomsteps) / 256)."<br><br>"; 
    #echo  $zoom.": ".pow(2,($zoomsteps-$zoom)).": ".$xlevelpix."-".$ylevelpix."<br>";
    for ($y = 0;$y < $ylevelpix;$y++)
    {

        for ($x = 0;$x < $xlevelpix;$x++)
        {

            if ($tilegroupcounter >= 256)
            {
                $tilegroup++;
                $tilegroupcounter = 0;
                
            }
            $tilegroupcounter++;
echo "Adding $zoom-$x-$y";
$ch = curl_init("$base_url/TileGroup$tilegroup/$zoom-$x-$y.jpg");

curl_setopt($ch, CURLOPT_NOBODY, true);
curl_exec($ch);
$retcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
// $retcode >= 400 -> not found, $retcode = 200, found.
curl_close($ch);
echo "- $retcode<br>";
			//$zip->addFromString("$zoom-$x-$y.jpg", file_get_contents("$base_url/TileGroup$tilegroup/$zoom-$x-$y.jpg"));

        }

    }

}


$zip->close();
//echo 'Archive created!';
//header('Content-disposition: attachment; filename=files.zip');
//header('Content-type: application/zip');
//readfile('test.zip');
?>
