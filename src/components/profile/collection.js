import React, { useEffect, useState } from "react";
import { SimpleGrid } from "@mantine/core";
import "./collection.css";


export default function Collection(props){


    return(
        <>
            <div className="boxContainer" >
                <SimpleGrid cols={5} spacing={"xl"} breakpoints={[
                { maxWidth: 1500, cols: 3, spacing: 'sm' },
                { maxWidth: 1000, cols: 2, spacing: 'sm' },
                { maxWidth: 600, cols: 1, spacing: 'sm' },
            ]}>

                    {props.elements}
                </SimpleGrid>

            </div>
    



        </>
    )

}