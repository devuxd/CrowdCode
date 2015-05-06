package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;

public class ReissueInFirebase extends DTO
{
	public String reissuedMicrotaskKey;
	public String reissueMotivation;

	// Default constructor (required by Jackson JSON library)
	public ReissueInFirebase()
	{
	}

	public ReissueInFirebase(String reissuedMicrotaskKey, String reissueMotivation) {

		this.reissuedMicrotaskKey=reissuedMicrotaskKey;
		this.reissueMotivation=reissueMotivation;
	}
}
