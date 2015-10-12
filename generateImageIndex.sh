cd assets
ls img/* | gawk '
    BEGIN { ORS = ""; print " [ "}
    /Filesystem/ {next}
    { printf "%s\"%s\"",
          separator, $1
      separator = ", "
    }
    END { print " ] " }
' > images.json
cd ..
