package com.uwcandfound.app.models;

import jakarta.persistence.*;
import lombok.*;


@Entity 
@NoArgsConstructor 
@AllArgsConstructor 
@Table(name = "locations")
public class Locations {

    //id, place, landmark
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private  Long id;

    @Column(name = "name", nullable = false, length= 100)
    private String name;

    @Column(name = "landmark")
    private  String landmark;

    public String getName() {
        return name;
    }
}


