cd assets
ls the-happy-couple/* | gawk '
    BEGIN { ORS = ""; print " [ "}
    /Filesystem/ {next}
    { printf "%s\"%s\"",
          separator, $1
      separator = ", "
    }
    END { print " ] " }
' > images.json
cd ..
