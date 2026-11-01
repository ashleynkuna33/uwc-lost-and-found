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
    @Column(name = "locarion_id")
    private  Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String place;

    @Column(name = "landmark")
    private  String landmark;
}


